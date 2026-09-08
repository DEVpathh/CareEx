import Foundation
import Vision
import ImageIO
let url = URL(fileURLWithPath: CommandLine.arguments[1])
let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.usesLanguageCorrection = false // Do not autocorrect medicine names.
let supported = try request.supportedRecognitionLanguages()
request.recognitionLanguages = ["en-US", "hi-IN"].filter { supported.contains($0) }
try VNImageRequestHandler(url: url, options: [:]).perform([request])
let lines = (request.results ?? []).compactMap { item -> [String: Any]? in
    guard let candidate = item.topCandidates(1).first else { return nil }
    return ["text": candidate.string, "confidence": candidate.confidence]
}
let result: [String: Any] = ["text": lines.compactMap { $0["text"] as? String }.joined(separator: "\n"), "lines": lines, "languages": request.recognitionLanguages]
FileHandle.standardOutput.write(try JSONSerialization.data(withJSONObject: result))
