import { Parser, Language } from "web-tree-sitter";

let parser: Parser;
let ParBeginParEnd: Language;

(async () => {
  await Parser.init();
  parser = new Parser();
  let ParBeginParEnd = await Language.load("tree-sitter-parbeginparend.wasm");
  parser.setLanguage(ParBeginParEnd);
})();
