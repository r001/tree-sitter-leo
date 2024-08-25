package tree_sitter_leo_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-leo"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_leo.Language())
	if language == nil {
		t.Errorf("Error loading Leo grammar")
	}
}
