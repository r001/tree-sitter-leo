package tree_sitter_leo_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_leo "github.com/tree-sitter/tree-sitter-leo/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_leo.Language())
	if language == nil {
		t.Errorf("Error loading Leo grammar")
	}
}
