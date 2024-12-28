import XCTest
import SwiftTreeSitter
import TreeSitterLeo

final class TreeSitterLeoTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_leo())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Leo grammar")
    }
}
