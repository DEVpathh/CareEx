import { test, expect, type Page, type Locator } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Exercise the browser speech event lifecycle without physical microphones or cloud speech.
  await page.addInitScript(() => {
    const state = window as any
    state.__spoken = []
    state.__voiceOverlap = false
    state.__speaking = false
    let timer: ReturnType<typeof setTimeout>
    class Utterance { text: string; lang = ''; rate = 1; voice: unknown; onend?: () => void; onerror?: () => void; constructor(text: string) { this.text = text } }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: Utterance })
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      speak(message: Utterance) { state.__spoken.push({ text: message.text, lang: message.lang }); state.__speaking = true; timer = setTimeout(() => { state.__speaking = false; message.onend?.() }, 120) },
      cancel() { clearTimeout(timer); state.__speaking = false }, resume() {}, getVoices() { return [{ lang: 'hi-IN', name: 'Hindi' }, { lang: 'en-IN', name: 'English' }] },
    } })
    class Recognition {
      lang = ''; continuous = false; interimResults = false
      onresult?: (event: any) => void; onend?: () => void; onerror?: (event: any) => void
      start() { if (state.__speaking) state.__voiceOverlap = true; state.__recognition = this }
      abort() { if (state.__recognition === this) state.__recognition = null; this.onend?.() }
    }
    state.SpeechRecognition = Recognition
    state.__say = (text: string) => state.__recognition?.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: text }], { isFinal: true })] })
  })
})

async function wake(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Please tap to awake the kiosk', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'हेलो, क्या समस्या है आपको?' })).toBeVisible()
}
async function mute(page: Page) { await page.getByRole('button', { name: 'आवाज़ चालू', exact: true }).click() }
async function english(page: Page) { await page.getByRole('combobox', { name: 'Language / भाषा' }).selectOption('English') }

async function completeQuestions(page: Page) {
  const submitAnswer = async (button: Locator) => {
    // Register the listener first: a fast API can respond before click() returns.
    await Promise.all([
      page.waitForResponse(response => response.url().includes('/intake/questions') && response.status() === 200, { timeout: 8000 }),
      button.click(),
    ])
    await expect(page.locator('.conversation-card')).toHaveAttribute('aria-busy', 'false')
  }
  for (let index = 0; index < 35; index++) {
    await expect(page.locator('.conversation-card')).toHaveAttribute('aria-busy', 'false')
    if (await page.getByRole('button', { name: 'Add name and age', exact: true }).isVisible()) return
    const choices = page.locator('.answer-options button')
    if (await choices.count()) {
      const no = page.locator('.answer-options').getByRole('button', { name: 'No', exact: true })
      await submitAnswer(await no.count() ? no : choices.first())
    } else if (await page.locator('.severity-scale').isVisible()) {
      await submitAnswer(page.locator('.severity-scale').getByRole('button', { name: '4', exact: true }))
    } else {
      await page.locator('.question-answer textarea').fill('No other issues')
      await submitAnswer(page.getByRole('button', { name: 'Save answer', exact: true }))
    }
  }
  throw new Error('Intake did not finish')
}

test('full-screen wake animation, Hindi default, large text and blue/green theme at desktop and mobile', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.locator('.wake-screen')).toBeVisible()
  await page.screenshot({ path: 'artifacts/wake-desktop.png' })
  await page.getByRole('button', { name: 'Please tap to awake the kiosk' }).click()
  await expect(page.locator('.wake-screen')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'हेलो, क्या समस्या है आपको?' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Accessibility', exact: true })).toHaveCount(0)
  await expect(page.getByText('Speak, type, or tap', { exact: true })).toHaveCount(0)
  await expect(page.locator('.app-shell')).not.toHaveClass(/ayush-mode/)
  const blue = await page.locator('.brand-lockup .brand-logo').evaluate(element => getComputedStyle(element).filter)
  await page.getByRole('button', { name: 'आयुष', exact: true }).click()
  await expect(page.locator('.app-shell')).toHaveClass(/ayush-mode/)
  await expect.poll(() => page.locator('.brand-lockup .brand-logo').evaluate(element => getComputedStyle(element).filter)).not.toEqual(blue)
  await page.getByRole('button', { name: 'एलोपैथी', exact: true }).click()
  await mute(page)
  await page.screenshot({ path: 'artifacts/intake-hindi-desktop.png', fullPage: true })
  const dimensions = await page.locator('.step-number').evaluateAll(elements => elements.map(element => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })))
  expect(dimensions.every(item => item.width === item.height)).toBeTruthy()
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page.screenshot({ path: 'artifacts/intake-hindi-mobile.png', fullPage: true })
  expect(errors).toEqual([])
})

test('spoken Hindi updates the current answer, advances questions, and switches speech to English', async ({ page }) => {
  await wake(page)
  await expect.poll(() => page.evaluate(() => (window as any).__recognition?.lang)).toBe('hi-IN')
  await page.evaluate(() => (window as any).__say('मुझे दो दिन से सिर में दर्द है'))
  await expect(page.locator('#current-question')).toContainText('सिरदर्द')
  await expect.poll(() => page.evaluate(() => (window as any).__recognition?.lang)).toBe('hi-IN')
  await page.evaluate(() => (window as any).__say('नहीं'))
  await expect(page.locator('#current-question')).toContainText('0 से 10')
  await expect(page.locator('.context-note')).toContainText('मुझे दो दिन से सिर में दर्द है')
  await expect.poll(() => page.evaluate(() => (window as any).__recognition?.lang)).toBe('hi-IN')
  await page.evaluate(() => (window as any).__say('चार'))
  await expect(page.locator('#current-question')).toContainText('सिर में कहाँ')
  await english(page)
  await expect(page.locator('#current-question')).toContainText('Where is the headache')
  await expect.poll(() => page.evaluate(() => (window as any).__recognition?.lang)).toBe('en-IN')
  expect(await page.evaluate(() => (window as any).__voiceOverlap)).toBe(false)
  const spoken = await page.evaluate(() => (window as any).__spoken)
  expect(spoken.some((message: any) => message.lang === 'hi-IN' && message.text.includes('हेलो'))).toBeTruthy()
  expect(spoken.some((message: any) => message.lang === 'en-IN' && message.text.includes('Where is the headache'))).toBeTruthy()
})

test('patient completes intake, receives a token, and doctor edits persist after reload', async ({ page }) => {
  await wake(page); await mute(page); await english(page)
  await page.locator('#complaint').fill('Headache for 2 days')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.locator('#current-question')).toBeVisible()
  await completeQuestions(page)
  await page.getByRole('button', { name: 'Add name and age', exact: true }).click()
  const patientName = `Browser Patient ${Date.now()}`
  await page.getByLabel('Full name', { exact: true }).fill(patientName)
  await page.getByLabel('Age (years)', { exact: true }).fill('36')
  await page.getByRole('button', { name: 'Save details', exact: true }).click()
  await page.getByLabel('Use my answers to prepare today’s visit', { exact: true }).check()
  await page.getByLabel('Share my visit summary with the care team', { exact: true }).check()
  await page.getByRole('button', { name: 'Save permissions', exact: true }).click()
  await page.getByRole('button', { name: 'Review & Submit', exact: true }).click()
  await page.getByRole('button', { name: 'Send to doctor & get token', exact: true }).click()
  await expect(page.locator('.token-card strong')).toHaveText(/A-\d+/)
  await page.getByRole('button', { name: 'Doctor', exact: true }).click()
  await page.getByRole('textbox', { name: 'Search patients' }).fill(patientName)
  await page.locator('.queue-item').filter({ hasText: patientName }).click()
  await page.getByRole('button', { name: 'Edit case', exact: true }).click()
  await page.getByLabel('Chief complaint', { exact: true }).fill('Headache — clinician corrected')
  await page.getByLabel('Clinician notes / decision reason', { exact: true }).fill('Reviewed and edited during browser verification')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Your changes have been saved')
  await page.getByRole('button', { name: 'Approve case', exact: true }).click()
  await expect(page.locator('.case-heading .eyebrow')).toContainText('Approved')
  await page.screenshot({ path: 'artifacts/doctor-edited-desktop.png', fullPage: true })
  await page.reload()
  await page.getByRole('button', { name: 'Please tap to awake the kiosk', exact: true }).click()
  await expect(page.locator('.wake-screen')).toHaveCount(0)
  await english(page)
  await page.getByRole('button', { name: 'Doctor', exact: true }).click()
  await page.getByRole('textbox', { name: 'Search patients' }).fill(patientName)
  await page.locator('.queue-item').filter({ hasText: patientName }).click()
  await expect(page.locator('.clinical-fields')).toContainText('Headache — clinician corrected')
  await expect(page.locator('.clinical-fields')).toContainText('Reviewed and edited during browser verification')
  await expect(page.locator('.case-heading .eyebrow')).toContainText('Approved')
})

test('network and microphone failures show actionable messages and intake can retry', async ({ page }) => {
  await wake(page); await mute(page); await english(page)
  await page.route('**/api/v1/intake/questions', route => route.abort())
  await page.locator('#complaint').fill('Headache for 2 days')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Questions could not load')
  await expect(page.locator('#complaint')).toHaveValue('Headache for 2 days')
  await page.unroute('**/api/v1/intake/questions')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.locator('#current-question')).toBeVisible()
  await page.getByRole('button', { name: 'Start microphone', exact: true }).click()
  await page.evaluate(() => (window as any).__recognition?.onerror?.({ error: 'not-allowed' }))
  await expect(page.locator('.voice-error')).toContainText('Microphone permission is blocked')
})

test('urgent answers remain visible and an actual help request appears for staff', async ({ page }) => {
  await wake(page); await mute(page); await english(page)
  await page.locator('#complaint').fill('Chest pain for 2 hours')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.locator('.answer-options').getByRole('button', { name: 'Yes', exact: true }).click()
  await expect(page.locator('.emergency-screen')).toContainText('Please get staff assistance now')
  await page.getByRole('button', { name: 'Request staff assistance', exact: true }).click()
  await expect(page.locator('.emergency-screen')).toContainText('Your help request is in the staff queue')
  await page.getByRole('button', { name: 'Staff', exact: true }).click()
  await expect(page.locator('.staff-request').first()).toContainText('Priority review')
})

test('changing workspaces retains patient answers and stops the microphone', async ({ page }) => {
  await wake(page)
  await expect.poll(() => page.evaluate(() => (window as any).__recognition?.lang)).toBe('hi-IN')
  await page.evaluate(() => (window as any).__say('मुझे दो दिन से सिर में दर्द है'))
  await expect(page.locator('#current-question')).toBeVisible()
  await page.getByRole('button', { name: 'डॉक्टर', exact: true }).click()
  expect(await page.evaluate(() => (window as any).__recognition)).toBeNull()
  await page.getByRole('button', { name: 'मरीज़', exact: true }).click()
  await expect(page.locator('#current-question')).toContainText('सिरदर्द')
  await expect(page.locator('.context-note')).toContainText('मुझे दो दिन से सिर में दर्द है')
})
