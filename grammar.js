// Based on:
// https://github.com/AleoHQ/grammars/leo.abnf
// commit: 00c4d8c2a2f64e9fbfbb25d58e003ea9ebbdacdb
const PREC = {
  COMMENT: 0,      // //  /*  */
  ASSIGN: 1,       // =  += -=  *=  /=  %=  &=  ^=  |=  <<=  >>= 
//	EMPTY: 2
  TERNARY: 3,      // ?:
  OR: 4,           // ||
  AND: 5,          // &&
  EQUALITY: 6,     // ==  !=
  ORDERING: 7,     // <  <=  >  >=  
  BIT_XOR: 8,      // ^
  BIT_OR: 9,       // |
  BIT_AND: 10,     // &
  SHIFT: 11,       // <<  >>  >>>
  ADD: 12,         // +  -
  MULT: 13,        // *  /  %
  EXP: 14,         // **
  UNARY: 15,       // ! -
  PARENS: 16,      // (Expression)
  OBJ_ACCESS: 17,  // .
	GROUP_LITERAL: 18// (1,1)group
};

module.exports = grammar({
  name: 'leo',

		extras: $ => [
			$.comment,
			/\s/	
		],

	rules: {

		source_file: $ => seq( 
			repeat($.import_declaration),
			$.program_declaration
		),
		horizontal_tab: $ => /\t/,
		
		line_feed: $ => /\n/,

		carriage_return: $ => /\r/,

		space: $ => " ",
		
		visible_ascii: $ => /[!-~]/,

		safe_ascii: $ => choice(
			$.horizontal_tab,
			$.line_feed,
			$.carriage_return,
			$.space,
			$.visible_ascii
		),

		safe_nonascii: $ => choice(
			/[\u0080-\u2029]/,
			/[\u202F-\u2065]/,
			/[\u206A-\uD7FF]/,
			/[\uE000-\uFFFF]/, // FIXME: no idea how to set this class, it is wrong for sure
		),

		character: $ => choice(
			$.safe_ascii,
			$.safe_nonascii
		),

		line_terminator: $ => seq(
			choice(
				$.line_feed,
				$.carriage_return,
				$.carriage_return
			), $.line_feed)
		,

		whitespace: $ => choice(
			$.space,
			$.horizontal_tab,
			$.line_terminator
		),

		comment: _ => prec(PREC.COMMENT,
			token(
				choice(
					seq('//', /(\\+(.|\r?\n)|[^\\\n])*/),
					seq(
						'/*',
						/[^*]*\*+([^/*][^*]*\*+)*/,
						'/',
					),
				)
			)
		),

//		comment: $ => choice(
//			$.block_comment,
//			$.line_comment
//		),

		block_comment: $ => seq(
			'/*',
			$.rest_of_block_comment
		),

		rest_of_block_comment: $ => choice(
			seq(
				'*', $.rest_of_block_comment_after_star
			),
			seq( 
				$.not_star_or_line_feed_or_carriage_return,
				$.rest_of_block_comment
			),
			seq(
				$.line_terminator,
				$.rest_of_block_comment
			)
		),
		
		rest_of_block_comment_after_star: $ => choice(
			'/',
			seq(
				'*', 
				$.rest_of_block_comment_after_star
			),
			seq(
				$.not_star_or_slash_or_line_feed_or_carriage_return,
				$.rest_of_block_comment
			),
			seq(
				$.line_terminator,
				$.rest_of_block_comment
			)
		),

		not_star_or_line_feed_or_carriage_return: $ => choice(
			$.horizontal_tab,
			/[\x20-\x29]/,
			/[\x2B-\x7E]/,
			$.safe_nonascii
		),

		not_star_or_slash_or_line_feed_or_carriage_return: $ => choice(
			$.horizontal_tab,
			/[\x20-\x29]/,
			/[\x2B-\x2E]/,
			/[\x30-\x7E]/,
			$.safe_nonascii,
		),
		
		line_comment: $ => seq(
			'//', // '// comment'
			repeat($.not_line_feed_or_carriage_return)
		),

		not_line_feed_or_carriage_return: $ => choice(
			$.horizontal_tab,
			$.space,
			$.visible_ascii,
			$.safe_nonascii
		),

		keyword: $ => choice(
			'address',
			'assert',
			'assert_eq',
			'assert_neq',
			'block',
			'bool',
			'console',
			'const',
			'constant',
			'else',
			'field',
			'finalize',
			'for',
			'function',
			'group',
			'i8',
			'i16',
			'i32',
			'i64',
			'i128',
			'if',
			'import',
			'in',
			'inline',
			'let',
			'mapping',
			'private',
			'program',
			'public',
			'record',
			'return',
			'scalar',
			'self',
			'struct',
			'then',
			'transition',
			'u8',
			'u16',
			'u32',
			'u64',
			'u128',
		),

		decimal_digit: $ =>  /[0-9]/,

			nonzero_decimal_digit: $ => /[1-9]/,

			identifier: $ => seq(
				/[a-zA-Z]/,
				repeat(
					choice(
						/[a-zA-Z]/,
						/[0-9]/,
						'_'
					)	
				)
			),

			_numeral: $ => 
		/([0-9]_*)+/,

			tuple_index: $ => choice(
				'0',
				seq(
					$.nonzero_decimal_digit,
				repeat($.decimal_digit)
			),
		),

		unsigned_literal: $ => seq(
		$._numeral,
			choice(
				'u8',
				'u16',
				'u32',
				'u64',
				'u128',
			)
		),

		signed_literal: $ => seq(
			$._numeral,
			choice(
				'i8',
				'i16',
				'i32',
				'i64',
				'i128',
			)
		),
		
		field_literal: $ => seq(
			$._numeral,
			'field'
		),

		product_group_literal: $ => seq(
			$._numeral,
			'group'
		),

		scalar_literal: $ => seq(
			$._numeral,
			'scalar'
		),

		boolean_literal: $ => choice(
			'true',
			'false'
		),

		address_literal: $ => seq(
			'aleo1',
			/[a-z0-9]{58}/
		),

		annotation: $ => seq(
			'@', $.identifier
		),

		symbol: $ => choice(
			'!',
			'&&', '||',
			'==', '!=',
			"<", '<=', '>', '>=',
			'&', '|', '^',
			'<<', '>>',
			'+', '-', '*', '/', '%', '**',
			'=',
			'+=', '-=', '*=', '/=', '%=', '**=',
			'<<=', '>>=',
			'&=', '|=', '^=',
			'&&=', '||=',
			'(', ')',
			'[', ']',
			'{', '}',
			',', '.', '..', ';', ':', '::', '?',
			'->', '=>', '_'
		),
		
		program_id: $ => seq(
			field('name',$.identifier),
			'.',
			field('extension',$.identifier),
		),

		locator: $ => seq(
			$.program_id,
			'/',
			$.identifier
		),

		unsigned_type: $ => choice(
			'u8',
			'u16',
			'u32',
			'u64',
			'u128',
		),

		signed_type: $ => choice(
			'i8',
			'i16',
			'i32',
			'i64',
			'i128',
		),

		integer_type: $ => choice(
			$.unsigned_type,
			$.signed_type
		),

		field_type: $ => 'field',

		group_type: $ => 'group',

		scalar_type: $ => 'scalar',

		boolean_type: $ => 'bool',

		address_type: $ => 'address',

		unit_type: $ => seq(
			"(",
			")"
		),

		record_type: $ => choice(
			seq(
				$.identifier,
				optional(
					seq(
						'.',
						"record"
					)
				),
			),
			seq(
				$.locator,
				optional(
					seq(
						'.',
						"record"
					)
				),
			),
		),


		named_type: $=> choice(
			$.boolean_type,
			$.integer_type,
			$.field_type,
			$.group_type,
			$.scalar_type,
			$.address_type,
			$.record_type,
		),

		tuple_type: $ => seq(
			'(',
			$.type,
			repeat1(
				seq(
					',',
					$.type
			)
				),
			optional(
				','
			),
			')'
		),

		type: $ => choice(
			$.unsigned_type,
			$.signed_type,
			$.field_type,
			$.group_type,
			$.scalar_type,
			$.boolean_type,
			$.address_type,
			$.record_type,
			$.unit_type,
			$.tuple_type
		),

		group_coordinate: $ => choice(
			seq(
				optional('-'),
				$._numeral
			),
			'+',
			'-',
			'_'
		),

		affine_group_literal: $ => prec(PREC.GROUP_LITERAL,
			seq(
				'(',
				$.group_coordinate,
				',',
				$.group_coordinate,
				')group'
			)
		),
		
		literal: $ => choice(
		),

		group_literal: $ => choice(
		$.product_group_literal,
		$.affine_group_literal
		),

		variable: $ => prec(2, $.identifier),

		associated_constant: $ => seq(
			$.named_type,
			'::',
			$.identifier
		),

		free_function_call: $ => choice(
			seq(
				$.identifier,
				$.function_arguments
			),
			seq(
				$.locator,
				$.function_arguments
			)
		),

		associated_function_call: $ => seq(
			$.named_type,
			'::',
			$.identifier,
			$.function_arguments
		),
		
		function_arguments: $ => seq(
			'(',
			optional(
				seq(
					$._expression,
					repeat(
						seq(
							',',
							$._expression
						)
					),
					optional(','),
				),
			),
			')'
		),

		unit_expression: $ => seq(
			'(',
			')'
		),

		tuple_expression: $ => seq(
			'(',
			$._expression,
			repeat1(
				seq(
					',',
					$._expression,
				)
			),
			optional(','),
		')'
		),

		struct_expression: $ => seq(
			$.identifier,
			'{',
			$.struct_component_initializer,
			repeat(
				seq(
					',',
					$.struct_component_initializer
				)
			),
			optional(','),
			'}'
		),

		struct_component_initializer: $ => choice(
			$.identifier,
			seq(
				$.identifier,
				':',
				$._expression
			)
		),

		self_caller: $ => prec(PREC.OBJ_ACCESS,
			seq(
				'self',
				'.',
				'caller'
			)
		),

		block_height: $ => prec(PREC.OBJ_ACCESS,
			seq(
			'block',
			'.',
			'height'
			)
		),

		_postfix_expression: $ => choice(
			$.unsigned_literal,
			$.signed_literal,
			$.field_literal,
			$.product_group_literal,
			$.scalar_literal,
			$.boolean_literal,
			$.address_literal,
			$.affine_group_literal,
			$.variable,
			$.associated_constant,
			seq('(', $._expression, ')'),
			$.free_function_call,
			$.associated_function_call,
			$.unit_expression,
			$.tuple_expression,
			$.struct_expression,
			$.self_caller,
			$.block_height,
			$.tuple_component_expression,
			$.struct_component_expression,
			$.method_call
		),

		tuple_component_expression: $ => prec(PREC.OBJ_ACCESS,
			seq(
				$._postfix_expression,
				'.',
				$.tuple_index
			)
		),

		struct_component_expression: $ => prec(PREC.OBJ_ACCESS,
			seq(
				$._postfix_expression,
				'.',
				$.identifier
			)
		),

		method_call: $ => prec(PREC.OBJ_ACCESS,
			seq(
				$._postfix_expression,
				'.',
				$.identifier,
				$.function_arguments
			)
		),

		_expression: $ => choice(
			$.unsigned_literal,
			$.signed_literal,
			$.field_literal,
			$.product_group_literal,
			$.scalar_literal,
			$.boolean_literal,
			$.address_literal,
			$.affine_group_literal,
			$.variable,
			$.associated_constant,
			prec(PREC.PARENS, seq('(', $._expression, ')')),
			$.free_function_call,
			$.associated_function_call,
			$.unit_expression,
			$.tuple_expression,
			$.struct_expression,
			$.self_caller,
			$.block_height,
			$.tuple_component_expression,
			$.struct_component_expression,
			$.method_call,
			prec.right(PREC.UNARY,
				field(
					'unary_expression',
					choice(
						seq('!', $._expression),
						seq('-', $._expression),
					)
				)
			),
			prec.left(PREC.EXP,
				field(
					'exponential_expression',
					seq($._expression, '**', $._expression)
				)
			),
			prec.left(PREC.MULT,
				field(
					'multiplicative_expression',
					choice(
						seq($._expression, '*', $._expression),
						seq($._expression, '/', $._expression),
						seq($._expression, '%', $._expression)
					)
				)
			),
			prec.left(PREC.ADD,
				field(
					'additive_expression',
					choice(
						seq($._expression, '+', $._expression),
						seq($._expression, '-', $._expression)
					)
				)
			),
			prec.left(PREC.SHIFT,
				field(
					'shift_expression',
					choice(
						seq($._expression, '<<', $._expression),
						seq($._expression, '>>', $._expression)
					)
				)
			),
			prec.left(PREC.BIT_AND,
				field(
					'conjunctive_expression',
					seq($._expression, '&', $._expression),
				)
			),
			prec.left(PREC.BIT_OR,
				field(
					'disjunctive_expression',
					seq($._expression, '|', $._expression),
				)
			),
			prec.left(PREC.BIT_XOR,
				field(
					'exclusive_disjunctive_expression',
					seq($._expression, '^', $._expression)
				)
			),
			prec.left(PREC.ORDERING,
				field(
					'ordering_expression',
					choice(
						seq($._expression, '<', $._expression),
						seq($._expression, '>', $._expression),
						seq($._expression, '<=', $._expression),
						seq($._expression, '>=', $._expression),
					),
				)
			),
			prec.left(PREC.EQUALITY,
				field(
					'equality_expression',
					choice(
						seq($._expression, '==', $._expression),
						seq($._expression, '!=', $._expression),
					)
				)
			),
			prec.left(PREC.AND,
				field(
					'conditional_conjunctive_expression',
					seq(
						$._expression, '&&', $._expression 
					)
				)
			),
			prec.left(PREC.OR,
			field('conditional_disjunctive_expression', seq(
				$._expression, '||', $._expression 
			))),
			$.ternary_expression
		),

		ternary_expression: $ => prec.left(PREC.TERNARY,
			seq(
				$._expression,
				$.ternary_if,
				$._expression,
				$.ternary_else,
				$._expression
			)
		),

		ternary_if: $ => '?',
		ternary_else: $ => ':',


		block: $ => seq(
			'{',
			repeat(
				choice(
					$.return_statement,
					$.expression_statement,
					$.variable_declaration,
					$.conditional_statement,
					$.loop_statement,
					$.assignment_statement,
					$.assert_statement,
					$.block
				)
			),
			'}'
		),

		return_statement: $ => seq(
			'return',
			optional($._expression),
			optional(
				seq(
					'then',
					'finalize',
					$.function_arguments
				)
			),
			';'
		),

		expression_statement:$ => seq($._expression, ';'),

		variable_declaration:$ => seq(
			'let',
			$.identifier_or_identifiers,
			':',
			$.type,
			'=',
			$._expression,
			';'
		),

		constant_declaration:$ => seq(
			'const',
			$.identifier,
			':',
			$.type,
			'=',
			$._expression,
			';'
		),

		identifier_or_identifiers:$ => choice(
			$.identifier,
			seq(
				'(',
				$.identifier,
				repeat1(
					seq(
						',',
						$.identifier
				)
				),
				optional(','),
				')'
			)
		),

		branch: $ => seq('if', $._expression, $.block),

		conditional_statement: $ => choice(
			$.branch,
			seq($.branch, 'else', $.block),
			seq($.branch, 'else', $.conditional_statement),
		),

		loop_statement: $ => seq(
			'for',
			$.identifier,
			':',
			$.type,
			'in',
			$._expression,
			'..',
			optional('='),
			$._expression,
			$.block
		),
	
		assignment_operator: $ => choice(
			'=',
			'+=',
			'-=',
			'*=',
			'/=',
			'%=',
			'**=',
			'<<=',
			'>>=',
			'&=',
			'|=',
			'^=',
			'&&=',
			'||=',
		),

		assignment_statement: $ => prec(PREC.ASSIGN,
			seq(
				$._expression, $.assignment_operator, $._expression, ';'
			)
		), 

		assert_statement: $ => seq(
			optional(seq('console', '.')),
			choice(
				$.assert_call,
				$.assert_equal_call,
				$.assert_not_equal_call
			),
			';'
		),

		assert_call: $ => seq(
			'assert',
			'(',
			$._expression,
			')'
		),

		assert_equal_call: $ => seq(
			'assert_eq',
			'(',
			$._expression,
			',',
			$._expression,
			optional(','),
			')'
		),

		assert_not_equal_call: $ => seq(
			'assert_neq',
			'(',
			$._expression,
			',',
			$._expression,
			optional(','),
			')'
		),

		return_arrow: $ => '->',

		function_declaration: $ => seq(
			repeat($.annotation),
			'function',
			field("name", $.identifier),
			'(',
			optional($.function_parameters),
			')',
			optional(
				seq(
					$.return_arrow,
					$.type
				),
			),
			$.block
		),

	  function_parameters: $ => seq(
			$.function_parameter,
			repeat(
				seq(
					',',
					$.function_parameter
				)
			),
			optional(',')
		),	

		function_parameter: $ => seq(
			optional(choice('public', 'private', 'constant')),
			$.identifier, ':', $.type
		),

		inline_declaration: $ => seq(
			repeat($.annotation),
			'inline',
			field("name", $.identifier),
			'(',
			optional($.function_parameters),
			')',
			optional(
				seq(
					$.return_arrow,
					$.type
				)
			),
			$.block
		),

		transition_declaration: $ => seq(
			repeat($.annotation),
			'transition',
			field('name', $.identifier),
				'(',
				optional($.function_parameters),
				')',
			optional(
				seq(
					$.return_arrow,
					optional(
						field( 'output_visibility',
							choice(
								'public',
								'private',
								'constant'
							)
						)
					),
					$.type
				),
			),
			field('body', $.block),
			optional($.finalizer)
		),

		finalizer: $ => seq(
			'finalize',
			field('name',$.identifier),
			'(',
			optional($.function_parameters),
			')',
			optional(
				seq(
					$.return_arrow,
					optional(
						field('output_visibility',
							choice(
							'public',
							'private',
							'constant',
							)
						)
					),
					field('output_type',$.type)
				),
			),
			field('body',$.block)
		),

		struct_declaration: $ => seq(
			'struct',
			field('name', $.identifier),
			'{',
			$.struct_component_declarations,
			'}'
		),

		struct_component_declarations: $ => seq(
			$.struct_component_declaration,
			repeat(seq(',', $.struct_component_declaration)),
			optional(',')
		),


		struct_component_declaration: $ =>
		seq(
			optional( 
				choice( 
					'public',
					'private',
					'constant',
				)
			),
			$.identifier,
			':',
			$.type),


		record_declaration: $ => seq(
			'record', $.identifier, '{', $.struct_component_declarations, '}'
		),


		mapping_declaration: $ => seq(
			'mapping', $.identifier, ':', $.type, '=>', $.type, ';'
		),

		program_item: $ => choice(
			$.function_declaration,
			$.inline_declaration,
			$.transition_declaration,
			$.struct_declaration,
			$.record_declaration,
			$.mapping_declaration,
			$.constant_declaration
		),

		program_declaration: $ => seq(
			'program', $.program_id, '{', repeat($.program_item), '}'
		),

		import_declaration: $ => seq(
			'import', $.program_id, ';'
		),

	},

});
