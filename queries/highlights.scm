(identifier) @variable 

[
 "assert"
 "assert_eq"
 "assert_neq"
 "block"
 "console"
 "const"
 "constant"
 "finalize"
 "in"
 "let"
 "mapping"
 "private"
 "program"
 "public"
 "record"
 "self"
 "struct"
] @keyword

[
 "transition"
 "function"
 "inline"
] @keyword.function

"import" @include

"return" @keyword.return

"for" @repeat

[ 
  "if"
  "then"
  "else"
] @conditional

[
 (ternary_if)
 (ternary_else)
] @conditional.ternary


[ ";" "," "::"] @punctuation.delimiter

[
"!"

"&&"
"||"

"=="
"!="

"<"
"<="
">"
">="

"&"
"|"
"^"

"<<"
">>"

"+"
"-"
"*"
"/"
"%"
"**"

"="

"+="
"-="
"*="
"/="
"%="
"**="

"<<="
">>="

"&="
"|="
"^="

"&&="
"||="

] @operator

(comment) @comment

(boolean_literal) @boolean

(constant_declaration 
  (identifier) @constant)

[
 (this_program_id)
 (program_id)
] @string

;record declaration
(record_declaration (identifier) @field) 

;struct component 
(struct_component_declaration 
  (identifier) @field) 

(type) @type

(associated_constant) @constant

[
 (self_caller)
 (block_height)
] @constant.builtin

(transition_declaration
  .
  name: (identifier) @function.bultin
  .
  (function_parameters)*
  .
  (return_arrow) @keyword.return
  .
  (type)
  .
  (block)
  .
)

;external transition call
;will be wrong for internal function calls!
(free_function_call
  (identifier)  @function ) 

(function_declaration
  .
  name: (identifier) @function
  .
  (function_parameters)*
  .
  (return_arrow) @keyword.return
  .
  (type)
  .
  (block)
  .
)

(inline_declaration
  .
  name: (identifier) @function
  .
  (function_parameters)*
  .
  (return_arrow) @keyword.return
  .
  (type)
  .
  (block)
  .
)

(method_call
  .
  (_)
  .
  (identifier) @method)

(function_parameter
 (identifier) @parameter) 

(struct_declaration
  name: (identifier) @field)

[ 
  (unsigned_literal) 

  (signed_literal) 

  (field_literal) 

  (product_group_literal) 

  (affine_group_literal) 

  (scalar_literal) 

  (address_literal)
] @number
