import Foundation
import PDFKit

// Usage: swift check-pdf.swift file.pdf visible.txt
// Prints page count, metadata and link count, and fails if any HTML word is missing or split in the PDF text.
let args = CommandLine.arguments
let doc = PDFDocument(url: URL(fileURLWithPath: args[1]))!
let expected = try! String(contentsOfFile: args[2], encoding: .utf8)
print("pages:", doc.pageCount)
for key in [PDFDocumentAttribute.titleAttribute, .authorAttribute, .creatorAttribute, .subjectAttribute, .producerAttribute] {
    print(key.rawValue, "=", doc.documentAttributes?[key] ?? "-")
}
var links = 0
for i in 0..<doc.pageCount { links += doc.page(at: i)?.annotations.filter { $0.url != nil }.count ?? 0 }
print("link annotations:", links)

func words(_ s: String, minLength: Int) -> Set<String> {
    Set(s.lowercased().components(separatedBy: CharacterSet.alphanumerics.inverted).filter { $0.count >= minLength })
}
let missing = words(expected, minLength: 3).subtracting(words(doc.string ?? "", minLength: 1)).sorted()
print("HTML words not found intact in PDF text:", missing.isEmpty ? "none" : missing.joined(separator: ", "))
exit(missing.isEmpty ? 0 : 1)
