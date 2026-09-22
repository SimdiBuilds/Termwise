var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/_source.ts
var source_exports = {};
__export(source_exports, {
  default: () => source_default
});
module.exports = __toCommonJS(source_exports);

// server.ts
var import_express = __toESM(require("express"), 1);
var import_multer = __toESM(require("multer"), 1);
var import_crypto = __toESM(require("crypto"), 1);

// server/storage.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_supabase_js = require("@supabase/supabase-js");

// server/data/furtherMathCurriculum.ts
var FURTHER_MATH_SUBJECT = {
  id: "sub-further-math",
  name: "Further Mathematics",
  code: "FM-Y10-T1",
  description: "Honeyland College Further Mathematics e-note (1st Term) for Year 10 - Excellence in Knowledge",
  createdAt: "2026-09-17T00:00:00.000Z"
};
var FURTHER_MATH_DOCUMENT = {
  id: "doc-honeyland-fm-y10-t1",
  subjectId: "sub-further-math",
  title: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
  filename: "Further_Mathematics_Year10_Term1_e-note.pdf",
  pageCount: 57,
  uploadDate: "2026-09-17T00:00:00.000Z",
  previewText: "Honeyland College Further Mathematics e-note (1st Term) for Year 10. Topics covered: Indices, Indicial Equations, Logarithms I, Logarithms II, Surd I, Surd II, Sequence and Series (A.P), Sequence and Series (G.P), Operation of Sets and Venn Diagrams."
};
var FURTHER_MATH_TOPICS = [
  {
    id: "top-fm-indices",
    subjectId: "sub-further-math",
    title: "Topic 1: Indices",
    order: 1,
    description: "Laws or rules of indices, power of power, negative and fractional indices, and algebraic indices simplifications (Week 1)."
  },
  {
    id: "top-fm-indicial-equations",
    subjectId: "sub-further-math",
    title: "Topic 2: Indicial Equations",
    order: 2,
    description: "Exponential equations, base equating method, change of variable quadratic substitution, and graphs of exponential functions (Week 2)."
  },
  {
    id: "top-fm-logarithms-1",
    subjectId: "sub-further-math",
    title: "Topic 3: Logarithms I",
    order: 3,
    description: "Definition of logarithms, exponential-log form conversions, and fundamental laws of logarithm (Week 3)."
  },
  {
    id: "top-fm-logarithms-2",
    subjectId: "sub-further-math",
    title: "Topic 4: Logarithms II & Four-Figure Tables",
    order: 4,
    description: "Logarithmic equations, extraneous roots, characteristic and mantissa, bar notation for numbers < 1, and antilogarithms (Week 4)."
  },
  {
    id: "top-fm-surd-1",
    subjectId: "sub-further-math",
    title: "Topic 5: Surd I",
    order: 5,
    description: "Definition and types of surds (pure, mixed, compound), rules of manipulation, multiplication, conjugate surds, and rationalization (Week 5)."
  },
  {
    id: "top-fm-surd-2",
    subjectId: "sub-further-math",
    title: "Topic 6: Surd II",
    order: 6,
    description: "Equality of surds, square root of compound quadratic surds, and solving equations in irrational forms (Week 6)."
  },
  {
    id: "top-fm-ap",
    subjectId: "sub-further-math",
    title: "Topic 7: Sequence and Series (Arithmetic Progression)",
    order: 7,
    description: "Linear sequences, nth term formula Tn = a + (n-1)d, arithmetic mean insertion, and sum of an A.P (Week 8)."
  },
  {
    id: "top-fm-gp",
    subjectId: "sub-further-math",
    title: "Topic 8: Sequence and Series (Geometric Progression)",
    order: 8,
    description: "Exponential sequences, common ratio, nth term formula Tn = ar^(n-1), geometric mean, sum of G.P, and sum to infinity (Week 9)."
  },
  {
    id: "top-fm-sets",
    subjectId: "sub-further-math",
    title: "Topic 9: Operations of Sets and Venn Diagrams",
    order: 9,
    description: "Set notation, types of sets, operations (union, intersection, complement, difference), and 2-set & 3-set Venn diagram problems (Week 10)."
  }
];
var FURTHER_MATH_CONCEPTS = [
  // --- TOPIC 1: INDICES (pp. 3-7) ---
  {
    id: "c-fm-laws-of-indices",
    topicId: "top-fm-indices",
    topicTitle: "Topic 1: Indices",
    subtopicTitle: "Laws & Rules of Indices",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Multiplication & Division Laws of Indices",
    explanation: "Index is the power or exponent raised to a number or variable (e.g. in 2\xB3, 3 is the index). When two terms with similar bases are multiplied, their indices are added: a\u207F \xB7 a\u1D50 = a\u207F\u207A\u1D50. When divided, their indices are subtracted: a\u207F / a\u1D50 = a\u207F\u207B\u1D50.",
    definitions: [
      "Index (plural indices): The power or exponent raised to a base number or variable.",
      "Base: The number or variable being multiplied repeatedly by itself.",
      "Multiplication Law: If two terms with similar base are multiplied, add the indices: a\u207F \xB7 a\u1D50 = a\u207F\u207A\u1D50.",
      "Division Law: If two terms with similar base are divided, subtract the indices: a\u207F / a\u1D50 = a\u207F\u207B\u1D50."
    ],
    formulas: [
      "a\u207F \xB7 a\u1D50 = a\u207F\u207A\u1D50",
      "a\u207F / a\u1D50 = a\u207F\u207B\u1D50"
    ],
    keyFacts: [
      "Each number naturally has an index of 1 (e.g. 5 = 5\xB9), which is normally not written.",
      "Multiplication and division laws apply ONLY when the bases are identical."
    ],
    examples: [
      "4\xB3 \xB7 4\u2076 = 4\xB3\u207A\u2076 = 4\u2079 (Page 4)",
      "5\u2076 / 5\u2074 = 5\u2076\u207B\u2074 = 5\xB2 = 25 (Page 4)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 4,
    order: 1,
    prerequisiteNames: []
  },
  {
    id: "c-fm-power-zero-negative-indices",
    topicId: "top-fm-indices",
    topicTitle: "Topic 1: Indices",
    subtopicTitle: "Laws & Rules of Indices",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Power of a Power, Zero Index & Negative Power",
    explanation: "When an index is raised to another power, the indices are multiplied: (a\u207F)\u1D50 = a\u207F\u1D50. Any non-zero base with an index of 0 equals 1: a\u2070 = 1. A negative index denotes the reciprocal of the base with positive index: a\u207B\u207F = 1 / a\u207F.",
    definitions: [
      "Power of a Power Law: (a\u207F)\u1D50 = a\u207F\u1D50.",
      "Zero Index Rule: Any base raised to power zero equals 1: a\u2070 = 1.",
      "Negative Index Rule: a\u207B\u207F = 1 / a\u207F.",
      "Different Base Similar Index: a\u207F \xB7 b\u207F = (ab)\u207F and a\u207F / b\u207F = (a/b)\u207F."
    ],
    formulas: [
      "(a\u207F)\u1D50 = a\u207F\u1D50",
      "a\u2070 = 1 (for a \u2260 0)",
      "a\u207B\u207F = 1 / a\u207F",
      "a\u207F \xB7 b\u207F = (ab)\u207F",
      "a\u207F / b\u207F = (a/b)\u207F"
    ],
    keyFacts: [
      "Zero to the power 0 is indeterminate; a\u2070 = 1 holds for all non-zero real numbers a.",
      "A negative power does NOT make the number negative; it inverts the base into its reciprocal."
    ],
    examples: [
      "(2\xB3)\u2074 = 2\xB9\xB2 = 4096 (Page 4)",
      "3\u207B\xB2 = 1 / 3\xB2 = 1 / 9 (Page 4)",
      "5\u2070 = 1 (Page 4)",
      "7\xB2 \xB7 5\xB2 = (7 \xB7 5)\xB2 = 35\xB2 (Page 4)",
      "4\u2074 / 2\u2074 = (4/2)\u2074 = 2\u2074 = 16 (Page 5)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 4,
    order: 2,
    prerequisiteNames: ["Multiplication & Division Laws of Indices"]
  },
  {
    id: "c-fm-fractional-indices-simplification",
    topicId: "top-fm-indices",
    topicTitle: "Topic 1: Indices",
    subtopicTitle: "Simplification of Algebraic Expressions with Indices",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Fractional Indices & Algebraic Simplifications",
    explanation: "A term with a fractional index a^(n/m) can be represented in radical form as (\u207F\u221Aa)\u1D50 or \u1D50\u221A(a\u207F). In algebraic fractions, separate the coefficients and apply the laws of indices to corresponding variable bases.",
    definitions: [
      "Fractional Index Law: a^(n/m) = (\u1D50\u221Aa)\u207F.",
      "Radical: An expression involving a root symbol (\u221A)."
    ],
    formulas: [
      "a^(1/n) = \u207F\u221Aa",
      "a^(n/m) = (\u1D50\u221Aa)\u207F"
    ],
    keyFacts: [
      "The denominator of the fraction index represents the root index, while the numerator represents the power.",
      "Always simplify negative indices by taking reciprocals first or after combining terms."
    ],
    examples: [
      "8^(2/3) = (\xB3\u221A8)\xB2 = 2\xB2 = 4 (Page 5)",
      "Simplify 27^(-2/3): (\xB3\u221A27)\u207B\xB2 = 3\u207B\xB2 = 1 / 3\xB2 = 1 / 9 (Page 5)",
      "Multiply x\u2074y\xB3z\xB2 and xy\u2075z\u207B\xB9: x\u2074\u207A\xB9 \xB7 y\xB3\u207A\u2075 \xB7 z\xB2\u207B\xB9 = x\u2075y\u2078z (Page 5, Example 1)",
      "Solve (a\xB3b\xB2) / (a\xB2b\u2074) = a\xB3\u207B\xB2 \xB7 b\xB2\u207B\u2074 = ab\u207B\xB2 = a / b\xB2 (Page 5, Example 2)",
      "Simplify 5(8x\u2074 \xF7 2x\u2076) = 5(8 \xF7 2)(x\u2074\u207B\u2076) = 20x\u207B\xB2 = 20 / x\xB2 (Page 6, Example 4)",
      "Simplify ((81y\u2078) / (16x\u2074))^(3/4) = ((3y\xB2) / (2x))\xB3 = 27y\u2076 / 8x\xB3 (Page 6, Example 6)",
      "Simplify \u2075\u221A(x\xB9\u2070 / 32y\xB2\u2075) = x^(10/5) / (2 \xB7 y^(25/5)) = x\xB2 / 2y\u2075 (Page 7, Example 7)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 5,
    order: 3,
    prerequisiteNames: ["Multiplication & Division Laws of Indices", "Power of a Power, Zero Index & Negative Power"]
  },
  // --- TOPIC 2: INDICIAL EQUATIONS (pp. 8-11) ---
  {
    id: "c-fm-base-equating",
    topicId: "top-fm-indicial-equations",
    topicTitle: "Topic 2: Indicial Equations",
    subtopicTitle: "Solving Indicial Equations by Equating Bases",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Indicial Equations via Base Equating",
    explanation: "An exponential or indicial equation is an equation in which the pro-numeral (unknown) appears as an index. To solve an equation where the unknown is in the index, express both sides of the equation with the same base so that a^(f(x)) = a^(g(x)) implies f(x) = g(x).",
    definitions: [
      "Exponential (Indicial) Equation: An equation in which the unknown variable appears as an index or power.",
      "Base Equating Principle: If a\u02E3 = a\u02B8 (where a > 0, a \u2260 1), then x = y."
    ],
    formulas: [
      "If a^(f(x)) = a^(g(x)), then f(x) = g(x)"
    ],
    keyFacts: [
      "Both sides must be rewritten to powers of a single common prime base (such as 2, 3, 5).",
      "Remember to distribute the power across binomial expressions: (a\u1D50)\u207F = a\u1D50\u207F."
    ],
    examples: [
      "Solve 3\u02E3 = 81: 3\u02E3 = 3\u2074 \u27F9 x = 4 (Page 8, Example 1a)",
      "Solve 4^(x-1) = 256: 4^(x-1) = 4\u2074 \u27F9 x - 1 = 4 \u27F9 x = 5 (Page 8, Example 1b)",
      "Solve 6^(3x-1) = 36^(2x-1): 6^(3x-1) = 6^(2(2x-1)) \u27F9 3x - 1 = 4x - 2 \u27F9 x = 1 (Page 9, Example 1c)",
      "Solve 2^(3n) \xB7 16^(n+1) = 32: 2^(3n) \xB7 (2\u2074)^(n+1) = 2\u2075 \u27F9 2^(3n + 4n + 4) = 2\u2075 \u27F9 7n + 4 = 5 \u27F9 n = 1/7 (Page 9, Example 2)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 8,
    order: 1,
    prerequisiteNames: ["Multiplication & Division Laws of Indices"]
  },
  {
    id: "c-fm-indicial-quadratic-substitution",
    topicId: "top-fm-indicial-equations",
    topicTitle: "Topic 2: Indicial Equations",
    subtopicTitle: "Indicial Equations via Quadratic Substitution",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Indicial Equations Reducible to Quadratics",
    explanation: "When an indicial equation contains terms like a\xB2\u02E3 and a\u02E3, use the change of variable method by letting p = a\u02E3. This transforms the exponential equation into a standard quadratic equation ap\xB2 + bp + c = 0. Solve for p, then back-substitute to find x, discarding any negative or non-real roots.",
    definitions: [
      "Change of Variable Method: Substituting a single variable (e.g. p = a\u02E3) to reduce a higher-degree or transcendental equation into an algebraic polynomial.",
      "Extraneous/Non-real Root in Indices: A solution for the dummy variable (such as p = -1) that cannot produce a real value for x because a\u02E3 > 0 for all real x."
    ],
    formulas: [
      "a\xB2\u02E3 = (a\u02E3)\xB2",
      "Let p = a\u02E3 \u27F9 p\xB2 - kp + c = 0"
    ],
    keyFacts: [
      "For any positive base a, a\u02E3 can NEVER be negative or zero for real x. Thus if p = -1, 3\u02E3 = -1 has no real solution."
    ],
    examples: [
      "Solve 2\xB2\u02E3 - 6(2\u02E3) + 8 = 0: Let 2\u02E3 = p \u27F9 p\xB2 - 6p + 8 = 0 \u27F9 (p - 2)(p - 4) = 0 \u27F9 p = 2 or p = 4. Since 2\u02E3 = 2\xB9 \u27F9 x = 1; 2\u02E3 = 2\xB2 \u27F9 x = 2. Solutions: x = 1 or x = 2 (Page 9, Example 3)",
      "Solve 3^(2(x-1)) - 8(3^(x-2)) - 1 = 0: Express as (3\u02E3)\xB2 \xB7 3\u207B\xB2 - 8(3\u02E3 \xB7 3\u207B\xB2) - 1 = 0 \u27F9 w\xB2/9 - 8w/9 - 1 = 0 \u27F9 w\xB2 - 8w - 9 = 0 \u27F9 (w + 1)(w - 9) = 0 \u27F9 w = -1 or w = 9. Since 3\u02E3 = 9 \u27F9 x = 2; 3\u02E3 = -1 has no real root. Hence x = 2 (Page 10, Example 4)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 9,
    order: 2,
    prerequisiteNames: ["Indicial Equations via Base Equating"]
  },
  {
    id: "c-fm-exponential-graphs",
    topicId: "top-fm-indicial-equations",
    topicTitle: "Topic 2: Indicial Equations",
    subtopicTitle: "Graphs of Exponential Functions",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Graphing Simple Exponential Functions",
    explanation: "Plotting ordered pairs (x, 2\u02E3) produces the curve of y = 2\u02E3. Key features of this exponential curve: the graph is strictly increasing, values rise rapidly along the positive x-axis, and on the negative x-axis the graph approaches the x-axis asymptotically but never touches or crosses it (y = 0 is a horizontal asymptote).",
    definitions: [
      "Exponential Function: A function of the form y = a\u02E3, where base a > 0 and a \u2260 1.",
      "Horizontal Asymptote: A line y = c that the curve approaches indefinitely as x \u2192 \xB1\u221E."
    ],
    formulas: [
      "y = a\u02E3"
    ],
    keyFacts: [
      "The y-intercept of y = a\u02E3 is always (0, 1) since a\u2070 = 1.",
      "The exponential curve meets a horizontal line y = k (for k > 0) at exactly one point, confirming unique solutions for simple indicial equations (e.g. y = 2\xB3\u02E3 and y = 64 meet once at x = 2)."
    ],
    examples: [
      "Table of values for y = 2\u02E3 from x = -3 to 3: (-3, 0.125), (-2, 0.25), (-1, 0.5), (0, 1), (1, 2), (2, 4), (3, 8) (Page 10)",
      "Solving 2\xB3\u02E3 = 64 graphically: find intersection of y = 2\xB3\u02E3 and line y = 64, yielding 3x = 6 \u27F9 x = 2 (Page 11)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 10,
    order: 3,
    prerequisiteNames: ["Indicial Equations via Base Equating"]
  },
  // --- TOPIC 3: LOGARITHMS I (pp. 12-14) ---
  {
    id: "c-fm-logarithm-definition-laws",
    topicId: "top-fm-logarithms-1",
    topicTitle: "Topic 3: Logarithms I",
    subtopicTitle: "Definition & Fundamental Laws of Logarithms",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Logarithm Definition & Form Conversion",
    explanation: "Logarithm is defined as the power to which a base number must be raised to yield a given value. It is the inverse form of an exponential equation: b\u02E3 = a \u27FA log_b(a) = x. John Napier introduced logarithms to simplify arithmetic computations.",
    definitions: [
      "Logarithm: The exponent x indicating the power to which base b must be raised to equal a: log_b(a) = x \u27FA b\u02E3 = a.",
      "Exponential to Log Form: b\u02E3 = a \u27F9 log_b(a) = x.",
      "Log to Exponential Form: log_b(a) = x \u27F9 b\u02E3 = a."
    ],
    formulas: [
      "b\u02E3 = a \u27FA log_b(a) = x",
      "log_a(a) = 1",
      "log_a(1) = 0"
    ],
    keyFacts: [
      "Logarithms and exponents are inverse functions of each other.",
      "The base b of a logarithm must be positive and not equal to 1; the argument a must be strictly positive (a > 0)."
    ],
    examples: [
      "2\u2075 = 32 \u27FA log\u2082(32) = 5 (Page 12)",
      "6\xB2 = 36 \u27FA log\u2086(36) = 2 (Page 12)",
      "3\u207B\xB2 = 1/9 \u27FA log\u2083(1/9) = -2 (Page 12)",
      "10\xB3 = 1000 \u27FA log\u2081\u2080(1000) = 3 (Page 12)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 12,
    order: 1,
    prerequisiteNames: ["Indicial Equations via Base Equating"]
  },
  {
    id: "c-fm-laws-of-logarithms",
    topicId: "top-fm-logarithms-1",
    topicTitle: "Topic 3: Logarithms I",
    subtopicTitle: "Definition & Fundamental Laws of Logarithms",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Basic Laws of Logarithms (Product, Quotient, Power)",
    explanation: "The fundamental laws of logarithms govern their algebraic manipulation: Product Law: log_a(mn) = log_a(m) + log_a(n); Quotient Law: log_a(m/n) = log_a(m) - log_a(n); Power Law: log_a(x\u1D47) = b \xB7 log_a(x); Change of Base: log_a(x) = log_b(x) / log_b(a); Reciprocal Law: log_a(1/x) = -log_a(x).",
    definitions: [
      "Product (Addition) Law: log_a(mn) = log_a(m) + log_a(n).",
      "Quotient (Subtraction) Law: log_a(m/n) = log_a(m) - log_a(n).",
      "Power Law: log_a(x\u1D47) = b \xB7 log_a(x).",
      "Change of Base Law: log_a(x) = log_b(x) / log_b(a)."
    ],
    formulas: [
      "log_a(mn) = log_a(m) + log_a(n)",
      "log_a(m/n) = log_a(m) - log_a(n)",
      "log_a(x\u1D47) = b \xB7 log_a(x)",
      "log_a(x) = log_b(x) / log_b(a)",
      "log_a(1/x) = -log_a(x)"
    ],
    keyFacts: [
      "log(m + n) is NOT equal to log(m) + log(n); the sum of logarithms corresponds to the logarithm of the product.",
      "Logarithm of the base is always 1: log_n(n) = 1."
    ],
    examples: [
      "Expand log(21): log(3 \xD7 7) = log 3 + log 7 (Page 13, Example 1)",
      "Expand log(125/64): log(125) - log(64) = log(5\xB3) - log(4\xB3) = 3 log 5 - 3 log 4 = 3(log 5 - log 4) (Page 13, Example 2)",
      "Simplify 3 + log\u2082(5): 3 log\u2082(2) + log\u2082(5) = log\u2082(2\xB3) + log\u2082(5) = log\u2082(8 \xD7 5) = log\u2082(40) (Page 14, Example 3a)",
      "Simplify 4 log\u2086(2) = log\u2086(2\u2074) = log\u2086(16) (Page 14, Example 3b)",
      "Simplify 1/2 log\u2084(8) + log\u2084(32) - log\u2084(2): log\u2084(2^(3/2)) + log\u2084(2\u2075) - log\u2084(2\xB9) = log\u2084(2^(3/2 + 5 - 1)) = log\u2084(2^(11/2)) = (11/2)log\u2084(2) = (11/2)(1/2) = 11/4 (Page 14, Example 3d)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 13,
    order: 2,
    prerequisiteNames: ["Logarithm Definition & Form Conversion"]
  },
  // --- TOPIC 4: LOGARITHMS II (pp. 15-26) ---
  {
    id: "c-fm-logarithmic-equations",
    topicId: "top-fm-logarithms-2",
    topicTitle: "Topic 4: Logarithms II & Four-Figure Tables",
    subtopicTitle: "Solving Logarithmic Equations",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Solving Logarithmic Equations & Extraneous Roots",
    explanation: "Logarithmic equations are solved by using log laws to condense expressions on one or both sides into a single logarithm, then equating arguments or converting to exponential form. Solutions MUST always be tested in the original equation to identify and discard extraneous roots (arguments of logarithms must be strictly positive).",
    definitions: [
      "Logarithmic Equation: An equation that incorporates one or more logarithms with algebraic arguments.",
      "Extraneous Solution: A candidate root generated during algebraic transformation that is invalid because it causes a logarithm argument to be non-positive."
    ],
    formulas: [
      "If log_b(f(x)) = log_b(g(x)), then f(x) = g(x)",
      "Condition: f(x) > 0 and g(x) > 0"
    ],
    keyFacts: [
      "Logarithms of negative numbers or zero are undefined in real numbers.",
      "Always substitute potential answers back into the original expressions to verify validity."
    ],
    examples: [
      "Solve log\u2082(x+2) + log\u2082(3) = log\u2082(27): log\u2082[3(x+2)] = log\u2082(27) \u27F9 3x + 6 = 27 \u27F9 3x = 21 \u27F9 x = 7 (Page 15-16, Example 1)",
      "Solve log\u2083(x) + log\u2083(x-2) = log\u2083(x+10): log\u2083[x(x-2)] = log\u2083(x+10) \u27F9 x\xB2 - 2x = x + 10 \u27F9 x\xB2 - 3x - 10 = 0 \u27F9 (x-5)(x+2) = 0. Testing x = 5 gives valid logs; testing x = -2 produces log\u2083(-2) which is invalid. Disregard x = -2 as extraneous; final solution x = 5 (Page 16-17, Example 2)",
      "Solve log\u2083(5 + 4 log\u2082(x-1)) = 2: 5 + 4 log\u2082(x-1) = 3\xB2 = 9 \u27F9 4 log\u2082(x-1) = 4 \u27F9 log\u2082(x-1) = 1 \u27F9 x - 1 = 2\xB9 \u27F9 x = 3 (Page 17, Example 3)",
      "Solve log(x+5) - log(x-1) = 1 - log 2: log((x+5)/(x-1)) = log 10 - log 2 = log(5) \u27F9 (x+5)/(x-1) = 5 \u27F9 5x - 5 = x + 5 \u27F9 4x = 10 \u27F9 x = 2.5 (Page 17, Example 4)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 15,
    order: 1,
    prerequisiteNames: ["Basic Laws of Logarithms (Product, Quotient, Power)"]
  },
  {
    id: "c-fm-log-tables-characteristic-mantissa",
    topicId: "top-fm-logarithms-2",
    topicTitle: "Topic 4: Logarithms II & Four-Figure Tables",
    subtopicTitle: "Characteristics and Mantissa of Logarithms",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Characteristics, Mantissa & Bar Notation in Log Tables",
    explanation: "The common logarithm (base 10) of a number comprises two parts: the characteristic (the whole/integral part) and the mantissa (the positive decimal part). For numbers > 1, characteristic is one less than the number of digits left of decimal. For numbers < 1, characteristic is negative (denoted with bar notation n\u0304 = -(n+1) zeros after decimal) and mantissa remains strictly positive.",
    definitions: [
      "Characteristic: The integral (whole number) component of a logarithm, determining the order of magnitude.",
      "Mantissa: The decimal part of the logarithm, obtained from log tables; mantissa is ALWAYS positive.",
      "Bar Notation: Representation where the negative sign is placed over the characteristic alone (e.g. 1\u0304.4393 = -1 + 0.4393)."
    ],
    formulas: [
      "log(N) = Characteristic + Mantissa",
      "For N > 1: Characteristic = (digits left of decimal) - 1",
      "For N < 1: Characteristic = 1\u0304, 2\u0304, 3\u0304... (count of zeros before first non-zero digit)",
      "-5.2592 = -6 + (1 - 0.2592) = 6\u0304 + 0.7428"
    ],
    keyFacts: [
      "A negative logarithm like -1.5607 must be converted to bar notation before using tables: -1.5607 = -2 + (1 - 0.5607) = 2\u0304.4393.",
      "Antilogarithm tables are used on the mantissa only, while the characteristic determines the position of the decimal point (add 1 to characteristic to count digits)."
    ],
    examples: [
      "Number 4: characteristic 0; 21: characteristic 1; 111: characteristic 2 (Page 18)",
      "Number 0.1: characteristic 1\u0304; 0.025: characteristic 2\u0304; 0.000010: characteristic 5\u0304 (Page 18)",
      "Converting negative mantissa: -5.2592 = -6 + (1 - 0.2592) = 6\u0304 + 0.7428 (Page 18)",
      "Adjusting bar characteristics for division: 1\u0304.3982 / 2 = (2\u0304 + 1.3982)/2 = 1\u0304.6991 (Page 24, Example 1a)",
      "7\u0304.4361 / 3 = (9\u0304 + 2.4361)/3 = 3\u0304.8120 (Page 24, Example 1c)",
      "Evaluating 26.81 \xD7 0.0734 / (0.573)\xB2 using log tables yields antilog 0.7776 = 5.992 (Page 26, Example c)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 18,
    order: 2,
    prerequisiteNames: ["Logarithm Definition & Form Conversion"]
  },
  // --- TOPIC 5: SURD I (pp. 27-32) ---
  {
    id: "c-fm-surd-definition-types",
    topicId: "top-fm-surd-1",
    topicTitle: "Topic 5: Surd I",
    subtopicTitle: "Definition and Classification of Surds",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Definition, Origin & Classification of Surds",
    explanation: 'Surds are irrational numbers that cannot be represented as recurring decimals or exact fractions; they can only be expressed in root form (e.g. \u221A2, \u221A3). The word derives from the Latin "surdus" meaning deaf or mute (from early Arabic classifications of numbers as audible/rational vs inaudible/irrational). Surds are classified into Pure surds, Mixed surds, and Compound surds.',
    definitions: [
      "Surd: An irrational root of a rational number which cannot be expressed exactly as a ratio of two integers.",
      "Pure Surd: A surd consisting of a single root of an integer with coefficient 1 (e.g. \u221A7, \u2074\u221A11).",
      "Mixed Surd: A combination of a rational coefficient and an irrational root (e.g. 8\u221A5, 3\u221A2).",
      "Compound Surd: An algebraic expression consisting of the sum or difference of two or more terms where at least one is a surd (e.g. 4 + \u221A3, \u221A5 + \u221A2)."
    ],
    formulas: [
      "Pure Surd: \u221Aa, \u207F\u221Aa",
      "Mixed Surd: k\u221Aa (where k is rational)",
      "Compound Surd: a + \u221Ab or \u221Aa \xB1 \u221Ab"
    ],
    keyFacts: [
      "\u221A4 = 2 and \u221A25 = 5 are NOT surds because their roots are rational integers.",
      "Numbers like \u03C0 and e are transcendental irrationals, not surds."
    ],
    examples: [
      "Surds: \u221A3, \u221A8, \u221A10, \xB3\u221A16, \u221A73 (Page 27)",
      "Not Surds: 8, -12.05, 3/7, \u221A25 = 5, \xB3\u221A8 = 2, \u221A0.25 = 0.5 (Page 27)",
      "Pure surd example: \u221A7, \u2074\u221A11; Mixed surd example: 8\u221A5; Compound surd: 4 + \u221A3 (Page 28)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 27,
    order: 1,
    prerequisiteNames: []
  },
  {
    id: "c-fm-surd-rules-operations",
    topicId: "top-fm-surd-1",
    topicTitle: "Topic 5: Surd I",
    subtopicTitle: "Rules of Surd Manipulation & Addition/Subtraction",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Rules of Surd Manipulation & Addition/Subtraction",
    explanation: "Surds can only be added or subtracted if they are similar (like) surds having the same radicand: m\u221Aa \xB1 n\u221Aa = (m \xB1 n)\u221Aa. Note critically that \u221A(a) + \u221A(b) \u2260 \u221A(a + b). For multiplication, \u221A(a) \xB7 \u221A(b) = \u221A(ab) and \u221A(a) \xB7 \u221A(a) = a. For division, \u221A(a) / \u221A(b) = \u221A(a/b).",
    definitions: [
      "Similar (Like) Surds: Surds having the identical irrational radical factor (e.g. 2\u221A5 and 3\u221A5).",
      "Radicand: The expression or number under the radical symbol (e.g. a in \u221Aa)."
    ],
    formulas: [
      "m\u221Aa + n\u221Aa = (m + n)\u221Aa",
      "m\u221Aa - n\u221Aa = (m - n)\u221Aa",
      "\u221A(a + b) \u2260 \u221Aa + \u221Ab",
      "\u221Aa \xB7 \u221Ab = \u221A(ab)",
      "\u221Aa \xB7 \u221Aa = a",
      "\u221Aa / \u221Ab = \u221A(a/b)"
    ],
    keyFacts: [
      "To simplify a surd, factorize the radicand into the product of a perfect square and another factor (e.g. \u221A18 = \u221A(9 \xD7 2) = 3\u221A2)."
    ],
    examples: [
      "Simplify 2\u221A5 + \u221A3 + \u221A2 + \u221A5 + 2\u221A3 = (2+1)\u221A5 + (1+2)\u221A3 + \u221A2 = 3\u221A5 + 3\u221A3 + \u221A2 (Page 29, Example 1a)",
      "Simplify \u221A18 + \u221A50 = \u221A(9\xD72) + \u221A(25\xD72) = 3\u221A2 + 5\u221A2 = 8\u221A2 (Page 29, Example 1b)",
      "Simplify \u221A80 - 10\u221A5 = \u221A(16\xD75) - 10\u221A5 = 4\u221A5 - 10\u221A5 = -6\u221A5 (Page 29, Example 1c)",
      "Simplify \u221A20 + \u221A45 + \u221A125 - 2\u221A80 = 2\u221A5 + 3\u221A5 + 5\u221A5 - 8\u221A5 = 2\u221A5 (Page 29, Example 1d)",
      "Product of 4\u221A3 and 2\u221A5 = (4 \xD7 2)\u221A(3 \xD7 5) = 8\u221A15 (Page 30, Example 2a)",
      "Expansion of (4 + 3\u221A2)\xB2 = 16 + 2(4)(3\u221A2) + (3\u221A2)\xB2 = 16 + 24\u221A2 + 18 = 34 + 24\u221A2 (Page 30, Example 2b)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 28,
    order: 2,
    prerequisiteNames: ["Definition, Origin & Classification of Surds"]
  },
  {
    id: "c-fm-conjugate-rationalization",
    topicId: "top-fm-surd-1",
    topicTitle: "Topic 5: Surd I",
    subtopicTitle: "Conjugate Surds & Rationalizing the Denominator",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Conjugate Surds & Rationalizing the Denominator",
    explanation: "Two quadratic surds are conjugate (complementary) to each other if their product produces a rational number: (\u221Aa + \u221Ab)(\u221Aa - \u221Ab) = (\u221Aa)\xB2 - (\u221Ab)\xB2 = a - b. Rationalization is the process of eliminating surds from the denominator by multiplying both numerator and denominator by the conjugate of the denominator.",
    definitions: [
      "Conjugate Surds: Pairs of binomial quadratic surds differing only in the sign connecting their terms (e.g. \u221Aa + \u221Ab and \u221Aa - \u221Ab).",
      "Rationalizing Factor: The surd or conjugate expression multiplied by an irrational denominator to convert it into a rational number.",
      "Rationalization: The process of clearing radicals from the denominator of a fraction."
    ],
    formulas: [
      "(\u221Aa + \u221Ab)(\u221Aa - \u221Ab) = a - b",
      "(a + \u221Ab)(a - \u221Ab) = a\xB2 - b",
      "k / \u221Aa = (k\u221Aa) / a",
      "k / (\u221Aa + \u221Ab) = k(\u221Aa - \u221Ab) / (a - b)"
    ],
    keyFacts: [
      "While \u221Aa + \u221Ab is irrational, its product with \u221Aa - \u221Ab is strictly rational (a - b).",
      "In rationalizing a/b, both the numerator and the denominator MUST be multiplied by the same conjugate factor."
    ],
    examples: [
      "Rationalize 3 / \u221A2: (3/\u221A2) \xD7 (\u221A2/\u221A2) = 3\u221A2 / 2 (Page 31, Example 1a)",
      "Rationalize (3 + \u221A2) / (\u221A5 + \u221A3): multiply by (\u221A5 - \u221A3)/(\u221A5 - \u221A3) \u27F9 (3+\u221A2)(\u221A5-\u221A3) / (5-3) = 1/2(3\u221A5 - 3\u221A3 + \u221A10 - \u221A6) (Page 31, Example 1b)",
      "Rationalize (1 + \u221A5) / (1 - \u221A5): multiply by (1+\u221A5)/(1+\u221A5) \u27F9 (1+\u221A5)\xB2 / (1-5) = (6 + 2\u221A5)/(-4) = -3/2 - (1/2)\u221A5 (Page 31, Example 1c)",
      "Express (8 - 3\u221A6) / (2\u221A3 + 3\u221A2) in form m\u221A3 + n\u221A2: multiply by (2\u221A3 - 3\u221A2) \u27F9 -17/3 \u221A3 - 7\u221A2, giving m = -17/3, n = -7 (Page 32, Example 2)",
      "Simplify \u221A3/(\u221A3 - 1) + \u221A3/(\u221A3 + 1) = \u221A3[(\u221A3+1 + \u221A3-1)/(3-1)] = \u221A3(2\u221A3 / 2) = \u221A3 \xD7 \u221A3 = 3 (Page 32, Example 3)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 30,
    order: 3,
    prerequisiteNames: ["Rules of Surd Manipulation & Addition/Subtraction"]
  },
  // --- TOPIC 6: SURD II (pp. 33-37) ---
  {
    id: "c-fm-equality-square-root-surds",
    topicId: "top-fm-surd-2",
    topicTitle: "Topic 6: Surd II",
    subtopicTitle: "Equality of Surds & Square Root of Surds",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Equality of Surds & Square Root of Compound Surds",
    explanation: "If two compound surds p + \u221Am and q + \u221An are equal, the rational parts must be equal (p = q) and the irrational surd parts must be equal (\u221Am = \u221An). This property allows finding the square root of a compound surd by assuming \u221A(a + b\u221Ac) = \u221Am + \u221An, squaring both sides to form a system m + n = a and 2\u221Amn = b\u221Ac, and solving the resulting quadratic equation.",
    definitions: [
      "Property of Equality of Surds: For p + \u221Am = q + \u221An, p = q and m = n.",
      "Square Root of a Surd: Finding \u221Am + \u221An such that (\u221Am + \u221An)\xB2 = a + 2\u221Ab."
    ],
    formulas: [
      "If p + \u221Am = q + \u221An \u27F9 p = q and m = n",
      "\u221A(a + 2\u221Ab) = \u221Am + \u221An \u27F9 m + n = a and mn = b"
    ],
    keyFacts: [
      "Squaring both sides converts the radical equation into simultaneous symmetric equations for m and n.",
      "Because m and n are symmetric, the two roots correspond to the two radicals (e.g. \u221A2 + \u221A5 = \u221A5 + \u221A2)."
    ],
    examples: [
      "Find the square root of 7 + 2\u221A10: Let \u221A(7 + 2\u221A10) = \u221Am + \u221An \u27F9 7 + 2\u221A10 = (m+n) + 2\u221Amn \u27F9 m + n = 7 and mn = 10. Solving n\xB2 - 7n + 10 = 0 gives n = 2, 5 \u27F9 m = 5, 2. Thus square root is \u221A2 + \u221A5 (Page 33-34, Example 1)",
      "Find the square root of 14 - 4\u221A6: Let \u221A(14 - 4\u221A6) = \u221An - \u221Am \u27F9 n + m = 14 and -4\u221A6 = -2\u221Amn \u27F9 mn = 24. Solving n\xB2 - 14n + 24 = 0 gives n = 12, 2 \u27F9 m = 2, 12. Thus square root is \u221A12 - \u221A2 or 2\u221A3 - \u221A2 (Page 34-35, Example 2)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 33,
    order: 1,
    prerequisiteNames: ["Conjugate Surds & Rationalizing the Denominator"]
  },
  {
    id: "c-fm-irrational-equations",
    topicId: "top-fm-surd-2",
    topicTitle: "Topic 6: Surd II",
    subtopicTitle: "Equations in Irrational Forms",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Equations in Irrational Forms (Radical Equations)",
    explanation: "An equation in irrational form is an algebraic equation where the variable appears under a radical sign. To solve: (1) Isolate the radical on one side; (2) Square both sides; (3) Simplify and solve the resulting polynomial; (4) CRITICAL STEP: Substitute each value back into the original equation to test for and eliminate extraneous roots introduced by squaring.",
    definitions: [
      "Irrational (Radical) Equation: An equation containing one or more radical expressions with variable radicands.",
      "Extraneous Root: A false solution that satisfies the squared equation but does NOT satisfy the original radical equation."
    ],
    formulas: [
      "\u221A(f(x)) = g(x) \u27F9 f(x) = [g(x)]\xB2"
    ],
    keyFacts: [
      "Squaring an equation is not always a reversible step (e.g. -3 squared is 9, but \u221A9 = +3). Therefore, checking all roots in the original equation is mathematically MANDATORY."
    ],
    examples: [
      "Solve 2\u221A(3x + 4) + x = 36: Isolate radical: 2\u221A(3x+4) = 36 - x. Square both sides: 4(3x+4) = (36-x)\xB2 \u27F9 12x + 16 = 1296 - 72x + x\xB2 \u27F9 x\xB2 - 84x + 1280 = 0 \u27F9 (x-20)(x-64) = 0. Testing x = 20: 2\u221A(64) + 20 = 16 + 20 = 36 (Valid!). Testing x = 64: 2\u221A(196) + 64 = 28 + 64 = 92 \u2260 36 (Extraneous!). Solution: x = 20 (Page 35, Example 1)",
      "Solve \u221A(x + 8) + \u221A(x + 1) = 7: Square both sides \u27F9 x+8 + 2\u221A((x+8)(x+1)) + x+1 = 49 \u27F9 2\u221A((x+8)(x+1)) = 40 - 2x. Square again \u27F9 4(x\xB2+9x+8) = (40-2x)\xB2 \u27F9 196x = 1568 \u27F9 x = 8. Test: \u221A(16) + \u221A(9) = 4 + 3 = 7 (Valid!) (Page 36, Example 2)",
      "Solve \u221A(x\xB2+3x-28) + \u221A(x\xB2-2x-8) = \u221A(6x\xB2-11x-52): Factorise expressions \u27F9 \u221A((x-4)(x+7)) + \u221A((x-4)(x+2)) = \u221A((6x+13)(x-4)). Factor out \u221A(x-4): x - 4 = 0 \u27F9 x = 4. Remaining equation yields x = 2 and x = -5/3. Solutions: x = 4, 2, -5/3 (Page 36-37, Example 3)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 35,
    order: 2,
    prerequisiteNames: ["Equality of Surds & Square Root of Compound Surds"]
  },
  // --- TOPIC 7: SEQUENCE AND SERIES (A.P) (pp. 38-42) ---
  {
    id: "c-fm-ap-nth-term",
    topicId: "top-fm-ap",
    topicTitle: "Topic 7: Sequence and Series (Arithmetic Progression)",
    subtopicTitle: "Sequences & Nth Term of an AP",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Linear Sequences & Nth Term of an AP (Tn = a + (n-1)d)",
    explanation: "A sequence is a set of numbers generated in accordance with a definite pattern. When consecutive terms differ by a constant value d (common difference), the sequence is an Arithmetic Progression (A.P). The nth term is given by Tn = a + (n - 1)d, where a is the first term and d = T_n - T_(n-1).",
    definitions: [
      "Sequence: An ordered list of numbers generated according to a mathematical rule.",
      "Term: Each individual number in a sequence.",
      "Arithmetic Progression (A.P): A linear sequence in which each term after the first is obtained by adding a constant common difference d to the preceding term.",
      "Common Difference (d): The constant difference between any term and its preceding term: d = T\u2082 - T\u2081 = T\u2083 - T\u2082."
    ],
    formulas: [
      "d = T_k - T_(k-1)",
      "Tn = a + (n - 1)d",
      "T\u2081 = a, T\u2082 = a + d, T\u2083 = a + 2d, T\u2084 = a + 3d"
    ],
    keyFacts: [
      "If d > 0, the A.P is increasing; if d < 0, the A.P is decreasing.",
      "Two terms from an A.P can be used to set up simultaneous linear equations in a and d."
    ],
    examples: [
      "Sequence 5, 9, 13, 17, 21... has common difference d = 4. Nth term = 4n + 1 (Page 38)",
      "Find 40th term of 6, 11, 16, 21...: a = 6, d = 5, n = 40 \u27F9 T\u2084\u2080 = 6 + (40-1)(5) = 6 + 195 = 201 (Page 40, Example 1)",
      "The 4th term of an A.P is 15 and the 9th term is 35. Find 15th term: a + 3d = 15 and a + 8d = 35 \u27F9 5d = 20 \u27F9 d = 4, a = 3. T\u2081\u2085 = 3 + 14(4) = 59 (Page 40, Example 2)",
      "If 8, x, y, z, 20 are in A.P, find x, y, z: a = 8, 5th term = a + 4d = 20 \u27F9 8 + 4d = 20 \u27F9 d = 3. Thus x = 11, y = 14, z = 17 (Page 40-41, Example 3)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 38,
    order: 1,
    prerequisiteNames: []
  },
  {
    id: "c-fm-arithmetic-mean-sum",
    topicId: "top-fm-ap",
    topicTitle: "Topic 7: Sequence and Series (Arithmetic Progression)",
    subtopicTitle: "Arithmetic Mean & Sum of an AP",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Arithmetic Mean & Sum of an AP (Sn = n/2[2a + (n-1)d])",
    explanation: "If p, q, r are in A.P, q is called the arithmetic mean of p and r: q = (p + r)/2. The sum of the first n terms Sn of an A.P is given by Sn = n/2 [2a + (n-1)d] or Sn = n/2 (a + l), where l is the last term.",
    definitions: [
      "Arithmetic Mean: The middle value between two terms in an A.P; for three terms p, q, r, q = (p + r) / 2.",
      "Series: The indicated sum of the terms of a sequence.",
      "Sum of an A.P (Sn): The total sum of the first n terms of an arithmetic progression."
    ],
    formulas: [
      "Arithmetic Mean: q = (p + r) / 2",
      "Sn = (n / 2) [2a + (n - 1)d]",
      "Sn = (n / 2) (a + l), where l = Tn = a + (n - 1)d"
    ],
    keyFacts: [
      "To insert k arithmetic means between two numbers A and B, the total number of terms becomes k + 2.",
      "The sum of terms from term (p+1) to term q is S_q - S_p."
    ],
    examples: [
      "Insert 3 arithmetic means between 19 and 35: 19, x, y, z, 35 \u27F9 a = 19, T\u2085 = a + 4d = 35 \u27F9 4d = 16 \u27F9 d = 4. Means are x = 23, y = 27, z = 31 (Page 41)",
      "Find sum of first 20 terms of 1, 5, 9, 13...: a = 1, d = 4, n = 20 \u27F9 S\u2082\u2080 = (20/2)[2(1) + (19)(4)] = 10(2 + 76) = 780 (Page 42, Example 1)",
      "Sum of first 10 terms is 255; sum of first 20 terms is 1010. Find sum of the next 20 terms: S\u2081\u2080 = 5(2a + 9d) = 255 \u27F9 2a + 9d = 51. S\u2082\u2080 = 10(2a + 19d) = 1010 \u27F9 2a + 19d = 101. Subtracting gives 10d = 50 \u27F9 d = 5, a = 3. Sum of first 30 terms S\u2083\u2080 = 15[2(3) + 29(5)] = 2265. Sum of next 20 terms = S\u2083\u2080 - S\u2081\u2080 = 2265 - 255 = 2010 (Page 42, Example 2)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 41,
    order: 2,
    prerequisiteNames: ["Linear Sequences & Nth Term of an AP (Tn = a + (n-1)d)"]
  },
  // --- TOPIC 8: SEQUENCE AND SERIES (G.P) (pp. 43-46) ---
  {
    id: "c-fm-gp-nth-term-mean",
    topicId: "top-fm-gp",
    topicTitle: "Topic 8: Sequence and Series (Geometric Progression)",
    subtopicTitle: "Nth Term & Geometric Mean",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Geometric Progression & Nth Term (Tn = ar^(n-1))",
    explanation: "A Geometric Progression (G.P) or exponential sequence is a sequence in which consecutive terms bear a constant ratio r = T_n / T_(n-1). The nth term is Tn = a \xB7 r^(n-1). The geometric mean of two numbers x and z is y = \u221A(xz).",
    definitions: [
      "Geometric Progression (G.P): A sequence in which each term after the first is obtained by multiplying the previous term by a constant common ratio r.",
      "Common Ratio (r): The constant ratio between any term and its predecessor: r = T\u2082 / T\u2081 = T\u2083 / T\u2082.",
      "Geometric Mean: The middle term between consecutive terms of a G.P: for x, y, z in G.P, y = \u221A(xz)."
    ],
    formulas: [
      "r = T_k / T_(k-1)",
      "Tn = a \xB7 r^(n-1)",
      "Geometric Mean: y = \u221A(xz)"
    ],
    keyFacts: [
      "Dividing equations for two known terms (e.g. T\u2084 / T\u2082) eliminates the first term a and allows solving directly for r."
    ],
    examples: [
      "In G.P 6, 12, 24, 48..., a = 6, r = 12/6 = 2. Nth term Tn = 6 \xB7 2^(n-1) (Page 43)",
      "The 2nd term of a G.P is 35 and 4th term is 875. Find r, a, and 5th term: ar = 35 and ar\xB3 = 875 \u27F9 ar\xB3/ar = 875/35 \u27F9 r\xB2 = 25 \u27F9 r = 5. a = 35/5 = 7. 5th term T\u2085 = 7 \xB7 5\u2074 = 7 \xD7 625 = 4375 (Page 43-44, Example 1)",
      "An exponential sequence has T\u2083 - T\u2081 = 48 and T\u2084 - T\u2082 = 144: a(r\xB2 - 1) = 48 and ar(r\xB2 - 1) = 144 \u27F9 r = 144/48 = 3. a(3\xB2 - 1) = 48 \u27F9 8a = 48 \u27F9 a = 6. 6th term T\u2086 = 6 \xB7 3\u2075 = 1458 (Page 44, Example 2)",
      "Insert two geometric means between 12 and 324: 12, x, y, 324 \u27F9 a = 12, T\u2084 = ar\xB3 = 324 \u27F9 r\xB3 = 27 \u27F9 r = 3. Means are x = 12(3) = 36 and y = 36(3) = 108 (Page 44-45)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 43,
    order: 1,
    prerequisiteNames: ["Multiplication & Division Laws of Indices"]
  },
  {
    id: "c-fm-gp-sum-infinity",
    topicId: "top-fm-gp",
    topicTitle: "Topic 8: Sequence and Series (Geometric Progression)",
    subtopicTitle: "Sum of a Geometric Series & Sum to Infinity",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Sum of GP & Sum to Infinity (S\u221E = a / (1 - r))",
    explanation: "The sum of the first n terms of a G.P is Sn = a(r\u207F - 1)/(r - 1) when r > 1, and Sn = a(1 - r\u207F)/(1 - r) when r < 1. If |r| < 1, as n \u2192 \u221E, r\u207F \u2192 0, yielding the sum to infinity: S\u221E = a / (1 - r).",
    definitions: [
      "Sum of a Geometric Series (Sn): The accumulated sum of the first n terms of a G.P.",
      "Sum to Infinity (S\u221E): The limit approached by the sum of an infinite geometric series when |r| < 1.",
      "Convergent Series: A series that approaches a finite sum as the number of terms approaches infinity (requires -1 < r < 1)."
    ],
    formulas: [
      "Sn = [a(r\u207F - 1)] / (r - 1) for |r| > 1",
      "Sn = [a(1 - r\u207F)] / (1 - r) for |r| < 1",
      "S\u221E = a / (1 - r) for |r| < 1"
    ],
    keyFacts: [
      "Sum to infinity exists ONLY if the common ratio satisfies |r| < 1. If |r| \u2265 1, the series diverges and has no finite sum to infinity."
    ],
    examples: [
      "The 3rd term of a G.P is 63 and 5th term is 567. Find sum of first 6 terms: ar\xB2 = 63, ar\u2074 = 567 \u27F9 r\xB2 = 9 \u27F9 r = 3, a = 7. S\u2086 = 7(3\u2076 - 1)/(3 - 1) = 7(728)/2 = 2546 (Page 45-46, Example 1)",
      "Find sum to infinity of 1, 1/4, 1/16, 1/64...: a = 1, r = (1/4)/1 = 1/4. S\u221E = a / (1 - r) = 1 / (1 - 1/4) = 1 / (3/4) = 4/3 (Page 46, Example 2)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 45,
    order: 2,
    prerequisiteNames: ["Geometric Progression & Nth Term (Tn = ar^(n-1))"]
  },
  // --- TOPIC 9: OPERATIONS OF SETS & VENN DIAGRAMS (pp. 46-57) ---
  {
    id: "c-fm-set-theory-types",
    topicId: "top-fm-sets",
    topicTitle: "Topic 9: Operations of Sets and Venn Diagrams",
    subtopicTitle: "Concept, Representation and Types of Sets",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Set Definitions, Representations & Classification",
    explanation: "A set is a clearly defined collection of distinct objects or numbers called elements. Sets are denoted by capital letters and enclosed in braces {}. Sets can be represented in semantic form, roster form {1, 2, 3...}, or set builder form {x \u2208 N : x < 10}. Types include finite, infinite, singleton/unit, empty/null (\u2205 or {}), equal, unequal, equivalent (equal cardinality), overlapping, disjoint, subsets (A \u2282 B), universal set (U), and power set (2\u207F subsets).",
    definitions: [
      "Set: A well-defined collection of distinct items, objects, or numbers.",
      "Elements: The individual members belonging to a set.",
      "Empty (Null) Set: A set containing zero elements, denoted \u2205 or {}.",
      "Singleton (Unit) Set: A set with exactly one member, e.g. {2}.",
      "Equivalent Sets: Sets having the identical cardinality (number of elements), even if elements differ.",
      "Power Set: The set of all subsets that a given set can contain; for n elements, power set has 2\u207F subsets."
    ],
    formulas: [
      "Number of subsets of a set with n elements = 2\u207F",
      "Roster form: A = {1, 2, 3, 4, 5}",
      "Set builder form: A = {x : x \u2208 N, x < 10}"
    ],
    keyFacts: [
      "The empty set \u2205 is a subset of EVERY set.",
      "Equal sets have identical elements; equivalent sets have identical number of elements."
    ],
    examples: [
      "Finite set: A = {1, 2, 5, 8, 11, 17, 18, 23}; Infinite set: {1, 2, 5, 8...} (Page 48)",
      "Power set of A = {1, 2, 3}: {\u2205, {1}, {2}, {3}, {1,2}, {1,3}, {2,3}, {1,2,3}} total 2\xB3 = 8 subsets (Page 48)",
      "Disjoint sets: A = {2, 5, 8} and B = {3, 1, 7} have no common element (A \u2229 B = \u2205) (Page 48)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 47,
    order: 1,
    prerequisiteNames: []
  },
  {
    id: "c-fm-set-operations-formulas",
    topicId: "top-fm-sets",
    topicTitle: "Topic 9: Operations of Sets and Venn Diagrams",
    subtopicTitle: "Set Operations and Set Formulas",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Set Operations (Union, Intersection, Complement) & Formulas",
    explanation: "Union (A \u222A B) consists of elements in A or B or both. Intersection (A \u2229 B) consists of elements common to both A and B. Set difference (A - B) consists of elements in A not in B. Complement (A\u2032) consists of all elements in universal set U not in A. Cardinality formula for two sets: n(A \u222A B) = n(A) + n(B) - n(A \u2229 B).",
    definitions: [
      "Union (\u222A): A \u222A B is the set of elements in A or B or both.",
      "Intersection (\u2229): A \u2229 B is the set of elements common to both A and B.",
      "Set Difference: A - B is the set of elements in A that are not in B.",
      "Complement: A\u2032 = U - A, the set of elements in universal set U not in A.",
      "Cartesian Product (A \xD7 B): The set of all ordered pairs (a, b) where a \u2208 A and b \u2208 B."
    ],
    formulas: [
      "n(A \u222A B) = n(A) + n(B) - n(A \u2229 B)",
      "n(A - B) = n(A \u222A B) - n(B) = n(A) - n(A \u2229 B)",
      "(A \u222A B)\u2032 = A\u2032 \u2229 B\u2032 (De Morgan\u2019s Law)",
      "(A \u2229 B)\u2032 = A\u2032 \u222A B\u2032 (De Morgan\u2019s Law)",
      "A \u2229 (B \u222A C) = (A \u2229 B) \u222A (A \u2229 C) (Distributive Law)"
    ],
    keyFacts: [
      "n(A \u222A B)\u2032 = n(U) - n(A \u222A B).",
      "For disjoint sets where A \u2229 B = \u2205, n(A \u222A B) = n(A) + n(B)."
    ],
    examples: [
      "If A = {1, 2, 5} and B = {1, 3, 4}, then A \u222A B = {1, 2, 3, 4, 5} (Page 49)",
      "If A = {1, 2, 3, 5} and B = {2, 4, 5, 8}, then A \u2229 B = {2, 5}; A - B = {1, 3}; B - A = {4, 8} (Page 49)",
      "Cartesian product of {1, 3} and {2, 5} = {(1,2), (1,5), (3,2), (3,5)} (Page 49)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 49,
    order: 2,
    prerequisiteNames: ["Set Definitions, Representations & Classification"]
  },
  {
    id: "c-fm-venn-diagrams-problems",
    topicId: "top-fm-sets",
    topicTitle: "Topic 9: Operations of Sets and Venn Diagrams",
    subtopicTitle: "Venn Diagrams & Real-Life Problems",
    subjectId: "sub-further-math",
    subjectName: "Further Mathematics",
    name: "Two-Set & Three-Set Venn Diagram Real-Life Problems",
    explanation: "Venn diagrams are pictorial diagrams using a rectangle for the universal set and circles for subsets to visualize logical relationships. In 2-set problems, n(U) = n(A only) + n(B only) + n(A \u2229 B) + n(neither). In 3-set problems, n(A \u222A B \u222A C) = n(A) + n(B) + n(C) - n(A \u2229 B) - n(A \u2229 C) - n(B \u2229 C) + n(A \u2229 B \u2229 C).",
    definitions: [
      "Venn Diagram: A pictorial representation of sets where the universal set is represented by a rectangle and subsets by overlapping circles.",
      "Disjoint Circles: Circles with no overlap representing mutually exclusive sets."
    ],
    formulas: [
      "Two Sets: n(U) = n(A - B) + n(B - A) + n(A \u2229 B) + n(A \u222A B)\u2032",
      "Three Sets: n(A \u222A B \u222A C) = n(A) + n(B) + n(C) - n(A \u2229 B) - n(A \u2229 C) - n(B \u2229 C) + n(A \u2229 B \u2229 C)"
    ],
    keyFacts: [
      "Start filling Venn diagrams from the innermost intersection (all three sets) and work outwards.",
      "Always verify that the sum of all disjoint regions equals the total universal set n(U)."
    ],
    examples: [
      "Survey of 15 adults: 8 smoke, 10 drink beer, all do at least one. Find both: 8 + 10 - x = 15 \u27F9 x = 3 both smoke and drink (Page 51, Example 1)",
      "18 passed Maths, 17 Physics, 11 passed both, 1 failed both. Total candidates = (18-11) + (17-11) + 11 + 1 = 7 + 6 + 11 + 1 = 25 (Page 51-52, Example 2)",
      "Honeyland College Science Students (U = 50): 18 Further Maths, 21 Chemistry, 16 Biology; 7 FM & Chem, 8 FM & Bio, 9 Chem & Bio, 5 all three. FM only = 18 - 7 - 8 + 5 = 8. Neither = 50 - (18+21+16 - 7-8-9 + 5) = 50 - 36 = 14 (Page 53-54, Example 1)",
      "Survey of 290 newspaper readers (Daily Times 181, Guardian 142, Punch 117): Read all three = 39; Exactly two papers = 72; Exactly one paper = 179; Guardian alone = 52 (Page 54-56, Example 2)"
    ],
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10",
    sourcePage: 51,
    order: 3,
    prerequisiteNames: ["Set Operations (Union, Intersection, Complement) & Formulas"]
  }
];
var FURTHER_MATH_QUESTIONS = [
  {
    id: "q-fm-1",
    conceptId: "c-fm-laws-of-indices",
    topicId: "top-fm-indices",
    subtopicTitle: "Laws & Rules of Indices",
    subjectId: "sub-further-math",
    category: "CALCULATION",
    type: "MULTIPLE_CHOICE",
    questionText: "According to the division law of indices in your notes, what is the evaluated value of 5\u2076 / 5\u2074?",
    options: ["5\xB9\u2070", "25", "125", "1"],
    correctAnswer: "25",
    explanation: "By the division law of indices (p. 4): 5\u2076 / 5\u2074 = 5\u2076\u207B\u2074 = 5\xB2 = 25.",
    sourcePage: 4,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-2",
    conceptId: "c-fm-power-zero-negative-indices",
    topicId: "top-fm-indices",
    subtopicTitle: "Laws & Rules of Indices",
    subjectId: "sub-further-math",
    category: "CALCULATION",
    type: "MULTIPLE_CHOICE",
    questionText: "Evaluate 3\u207B\xB2 as derived in the school notes on negative powers.",
    options: ["-6", "-9", "1/9", "1/6"],
    correctAnswer: "1/9",
    explanation: "From page 4 of the notes: a\u207B\u207F = 1 / a\u207F. Thus 3\u207B\xB2 = 1 / 3\xB2 = 1 / 9.",
    sourcePage: 4,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-3",
    conceptId: "c-fm-fractional-indices-simplification",
    topicId: "top-fm-indices",
    subtopicTitle: "Simplification of Algebraic Expressions with Indices",
    subjectId: "sub-further-math",
    category: "CALCULATION",
    type: "MULTIPLE_CHOICE",
    questionText: "Simplify 27^(-2/3) using the fractional index rules from page 5.",
    options: ["1/9", "9", "-18", "1/3"],
    correctAnswer: "1/9",
    explanation: "27^(-2/3) = (\xB3\u221A27)\u207B\xB2 = 3\u207B\xB2 = 1 / 3\xB2 = 1 / 9.",
    sourcePage: 5,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-4",
    conceptId: "c-fm-base-equating",
    topicId: "top-fm-indicial-equations",
    subtopicTitle: "Solving Indicial Equations by Equating Bases",
    subjectId: "sub-further-math",
    category: "APPLICATION",
    type: "MULTIPLE_CHOICE",
    questionText: "Solve for n in the indicial equation: 2^(3n) \xD7 16^(n+1) = 32.",
    options: ["1/7", "7", "1/2", "2"],
    correctAnswer: "1/7",
    explanation: "Express in base 2: 2^(3n) \xD7 (2\u2074)^(n+1) = 2\u2075 \u27F9 2^(3n + 4n + 4) = 2\u2075 \u27F9 7n + 4 = 5 \u27F9 7n = 1 \u27F9 n = 1/7 (Page 9, Example 2).",
    sourcePage: 9,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-5",
    conceptId: "c-fm-indicial-quadratic-substitution",
    topicId: "top-fm-indicial-equations",
    subtopicTitle: "Indicial Equations via Quadratic Substitution",
    subjectId: "sub-further-math",
    category: "APPLICATION",
    type: "MULTIPLE_CHOICE",
    questionText: "Solve 2\xB2\u02E3 - 6(2\u02E3) + 8 = 0 by substitution (let 2\u02E3 = p). What are the values of x?",
    options: ["x = 1 or x = 2", "x = 2 or x = 4", "x = 0 or x = 3", "x = -1 or x = 2"],
    correctAnswer: "x = 1 or x = 2",
    explanation: "p\xB2 - 6p + 8 = 0 \u27F9 (p - 2)(p - 4) = 0 \u27F9 p = 2 or p = 4. 2\u02E3 = 2\xB9 \u27F9 x = 1; 2\u02E3 = 2\xB2 \u27F9 x = 2 (Page 9, Example 3).",
    sourcePage: 9,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-6",
    conceptId: "c-fm-logarithm-definition-laws",
    topicId: "top-fm-logarithms-1",
    subtopicTitle: "Definition & Fundamental Laws of Logarithms",
    subjectId: "sub-further-math",
    category: "RECALL",
    type: "MULTIPLE_CHOICE",
    questionText: "Convert the exponential equation 3\u207B\xB2 = 1/9 into logarithmic form.",
    options: ["log\u2083(1/9) = -2", "log\u208B\u2082(3) = 1/9", "log\u2081/\u2089(3) = -2", "log\u2083(-2) = 1/9"],
    correctAnswer: "log\u2083(1/9) = -2",
    explanation: "By definition: b\u02E3 = a \u27FA log_b(a) = x. Here base b = 3, exponent x = -2, argument a = 1/9 (Page 12).",
    sourcePage: 12,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-7",
    conceptId: "c-fm-laws-of-logarithms",
    topicId: "top-fm-logarithms-1",
    subtopicTitle: "Definition & Fundamental Laws of Logarithms",
    subjectId: "sub-further-math",
    category: "CALCULATION",
    type: "MULTIPLE_CHOICE",
    questionText: "Simplify: 3 + log\u2082(5). Express as a single logarithm.",
    options: ["log\u2082(40)", "log\u2082(15)", "log\u2082(8)", "log\u2082(35)"],
    correctAnswer: "log\u2082(40)",
    explanation: "3 = 3 log\u2082(2) = log\u2082(2\xB3) = log\u2082(8). log\u2082(8) + log\u2082(5) = log\u2082(8 \xD7 5) = log\u2082(40) (Page 14, Example 3a).",
    sourcePage: 14,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-8",
    conceptId: "c-fm-logarithmic-equations",
    topicId: "top-fm-logarithms-2",
    subtopicTitle: "Solving Logarithmic Equations",
    subjectId: "sub-further-math",
    category: "APPLICATION",
    type: "MULTIPLE_CHOICE",
    questionText: "In solving log\u2083(x) + log\u2083(x-2) = log\u2083(x+10), why is x = -2 rejected?",
    options: [
      "It is an extraneous root because log of a negative number is undefined.",
      "Because -2 is not divisible by 3.",
      "Because x\xB2 - 3x - 10 = 0 has no real roots.",
      "Because the right side becomes negative."
    ],
    correctAnswer: "It is an extraneous root because log of a negative number is undefined.",
    explanation: "From page 17 of the notes: substituting x = -2 yields log\u2083(-2), which is undefined. Hence x = -2 is disregarded as an extraneous solution, leaving x = 5.",
    sourcePage: 17,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-9",
    conceptId: "c-fm-surd-definition-types",
    topicId: "top-fm-surd-1",
    subtopicTitle: "Definition and Classification of Surds",
    subjectId: "sub-further-math",
    category: "RECOGNITION",
    type: "MULTIPLE_CHOICE",
    questionText: "Which of the following is NOT a surd according to the classification table on page 27?",
    options: ["\u221A25", "\u221A3", "\u221A8", "\xB3\u221A16"],
    correctAnswer: "\u221A25",
    explanation: "\u221A25 = 5 is a rational number (an integer), so it is not a surd (Page 27 table).",
    sourcePage: 27,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-10",
    conceptId: "c-fm-conjugate-rationalization",
    topicId: "top-fm-surd-1",
    subtopicTitle: "Conjugate Surds & Rationalizing the Denominator",
    subjectId: "sub-further-math",
    category: "CALCULATION",
    type: "MULTIPLE_CHOICE",
    questionText: "Simplify by rationalizing the denominator: 3 / \u221A2.",
    options: ["3\u221A2 / 2", "3 / 2", "\u221A6 / 2", "6 / \u221A2"],
    correctAnswer: "3\u221A2 / 2",
    explanation: "(3 / \u221A2) \xD7 (\u221A2 / \u221A2) = 3\u221A2 / 2 (Page 31, Example 1a).",
    sourcePage: 31,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-11",
    conceptId: "c-fm-equality-square-root-surds",
    topicId: "top-fm-surd-2",
    subtopicTitle: "Equality of Surds & Square Root of Surds",
    subjectId: "sub-further-math",
    category: "APPLICATION",
    type: "MULTIPLE_CHOICE",
    questionText: "Find the square root of the compound surd 7 + 2\u221A10.",
    options: ["\u221A2 + \u221A5", "\u221A3 + \u221A4", "1 + \u221A10", "2 + \u221A5"],
    correctAnswer: "\u221A2 + \u221A5",
    explanation: "Let \u221A(7 + 2\u221A10) = \u221Am + \u221An \u27F9 m + n = 7 and mn = 10. The factors are 2 and 5. Hence the square root is \u221A2 + \u221A5 (Page 33-34, Example 1).",
    sourcePage: 33,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-12",
    conceptId: "c-fm-irrational-equations",
    topicId: "top-fm-surd-2",
    subtopicTitle: "Equations in Irrational Forms",
    subjectId: "sub-further-math",
    category: "APPLICATION",
    type: "MULTIPLE_CHOICE",
    questionText: "Solve the radical equation 2\u221A(3x + 4) + x = 36. Which value is the valid solution?",
    options: ["x = 20", "x = 64", "x = 20 and x = 64", "x = 36"],
    correctAnswer: "x = 20",
    explanation: "Squaring yields x = 20 and x = 64. Testing x = 64 in the original equation gives 28 + 64 = 92 \u2260 36 (extraneous root!). Only x = 20 satisfies the equation (Page 35, Example 1).",
    sourcePage: 35,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-13",
    conceptId: "c-fm-ap-nth-term",
    topicId: "top-fm-ap",
    subtopicTitle: "Sequences & Nth Term of an AP",
    subjectId: "sub-further-math",
    category: "CALCULATION",
    type: "MULTIPLE_CHOICE",
    questionText: "Find the 40th term of the linear sequence 6, 11, 16, 21...",
    options: ["201", "206", "196", "211"],
    correctAnswer: "201",
    explanation: "a = 6, d = 5, n = 40. T\u2084\u2080 = a + (n - 1)d = 6 + (39 \xD7 5) = 6 + 195 = 201 (Page 40, Example 1).",
    sourcePage: 40,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-14",
    conceptId: "c-fm-arithmetic-mean-sum",
    topicId: "top-fm-ap",
    subtopicTitle: "Arithmetic Mean & Sum of an AP",
    subjectId: "sub-further-math",
    category: "CALCULATION",
    type: "MULTIPLE_CHOICE",
    questionText: "Calculate the sum of the first 20 terms of the linear sequence 1, 5, 9, 13...",
    options: ["780", "800", "760", "740"],
    correctAnswer: "780",
    explanation: "a = 1, d = 4, n = 20. S\u2082\u2080 = (20/2)[2(1) + (19 \xD7 4)] = 10[2 + 76] = 10(78) = 780 (Page 42, Example 1).",
    sourcePage: 42,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-15",
    conceptId: "c-fm-gp-nth-term-mean",
    topicId: "top-fm-gp",
    subtopicTitle: "Nth Term & Geometric Mean",
    subjectId: "sub-further-math",
    category: "CALCULATION",
    type: "MULTIPLE_CHOICE",
    questionText: "The 2nd term of a G.P is 35 and the 4th term is 875. What is the common ratio r?",
    options: ["5", "25", "7", "3"],
    correctAnswer: "5",
    explanation: "ar = 35 and ar\xB3 = 875 \u27F9 ar\xB3/ar = r\xB2 = 875/35 = 25 \u27F9 r = \u221A25 = 5 (Page 43-44, Example 1).",
    sourcePage: 44,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-16",
    conceptId: "c-fm-gp-sum-infinity",
    topicId: "top-fm-gp",
    subtopicTitle: "Sum of a Geometric Series & Sum to Infinity",
    subjectId: "sub-further-math",
    category: "CALCULATION",
    type: "MULTIPLE_CHOICE",
    questionText: "Find the sum to infinity of the sequence 1, 1/4, 1/16, 1/64...",
    options: ["4/3", "3/4", "2", "1/3"],
    correctAnswer: "4/3",
    explanation: "a = 1, r = 1/4. S\u221E = a / (1 - r) = 1 / (1 - 1/4) = 1 / (3/4) = 4/3 (Page 46, Example 2).",
    sourcePage: 46,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-17",
    conceptId: "c-fm-set-theory-types",
    topicId: "top-fm-sets",
    subtopicTitle: "Concept, Representation and Types of Sets",
    subjectId: "sub-further-math",
    category: "RECALL",
    type: "MULTIPLE_CHOICE",
    questionText: "How many subsets does the power set of A = {1, 2, 3} contain?",
    options: ["8", "6", "3", "9"],
    correctAnswer: "8",
    explanation: "From page 48 of the notes: a simple formula to know the number of subsets of a power set is 2\u207F. Here n = 3, so 2\xB3 = 8 subsets.",
    sourcePage: 48,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-18",
    conceptId: "c-fm-set-operations-formulas",
    topicId: "top-fm-sets",
    subtopicTitle: "Set Operations and Set Formulas",
    subjectId: "sub-further-math",
    category: "CALCULATION",
    type: "MULTIPLE_CHOICE",
    questionText: "If set A = {1, 2, 3, 5} and set B = {2, 4, 5, 8}, what is the set difference A - B?",
    options: ["{1, 3}", "{4, 8}", "{2, 5}", "{1, 2, 3, 4, 5, 8}"],
    correctAnswer: "{1, 3}",
    explanation: "From page 49: A - B is the element(s) in set A that are not in set B. The elements in A not in B are 1 and 3.",
    sourcePage: 49,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-19",
    conceptId: "c-fm-venn-diagrams-problems",
    topicId: "top-fm-sets",
    subtopicTitle: "Venn Diagrams & Real-Life Problems",
    subjectId: "sub-further-math",
    category: "APPLICATION",
    type: "MULTIPLE_CHOICE",
    questionText: "In a survey of 15 adults (p. 51), 8 smoked cigarettes and 10 drank beer. If every adult did at least one, how many both smoked and drank beer?",
    options: ["3", "5", "7", "2"],
    correctAnswer: "3",
    explanation: "n(C) + n(B) - n(C \u2229 B) = U \u27F9 8 + 10 - x = 15 \u27F9 18 - x = 15 \u27F9 x = 3 (Page 51, Example 1).",
    sourcePage: 51,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  },
  {
    id: "q-fm-20",
    conceptId: "c-fm-venn-diagrams-problems",
    topicId: "top-fm-sets",
    subtopicTitle: "Venn Diagrams & Real-Life Problems",
    subjectId: "sub-further-math",
    category: "APPLICATION",
    type: "MULTIPLE_CHOICE",
    questionText: "At Honeyland College (U = 50 science students, p. 53): 18 offer Further Maths, 21 Chemistry, 16 Biology; 7 FM & Chem, 8 FM & Bio, 9 Chem & Bio, and 5 all three. How many offer Further Mathematics only?",
    options: ["8", "10", "4", "14"],
    correctAnswer: "8",
    explanation: "Number offering only Further Mathematics = n(F) - n(F \u2229 C) - n(F \u2229 B) + n(F \u2229 C \u2229 B) = 18 - 7 - 8 + 5 = 8 students (Page 54, Example 1i).",
    sourcePage: 54,
    sourceDocument: "Honeyland College Further Mathematics e-note (1st Term) for Year 10"
  }
];

// server/storage.ts
var DATA_DIR = process.env.VERCEL ? "/tmp/termwise-data" : import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "database.json");
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      return (0, import_supabase_js.createClient)(url, key);
    } catch (err) {
      console.warn("Failed to initialize Supabase client:", err);
    }
  }
  return null;
}
var SEED_DATA = {
  subjects: [
    FURTHER_MATH_SUBJECT,
    {
      id: "sub-physics",
      name: "Physics: Mechanics & Energy",
      code: "PHY-101",
      description: "Kinematics, Newton\u2019s Laws of Motion, Work, Energy, Momentum and Gravitation based on school term syllabus.",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "sub-chemistry",
      name: "Chemistry: Structure & Stoichiometry",
      code: "CHM-101",
      description: "Atomic structure, periodic trends, chemical bonding, stoichiometry, and mole calculations.",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "sub-biology",
      name: "Biology: Cell Biology & Genetics",
      code: "BIO-101",
      description: "Cellular ultrastructure, membrane transport, cell division (mitosis/meiosis), and Mendelian inheritance.",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  topics: [
    ...FURTHER_MATH_TOPICS,
    // Physics
    {
      id: "top-kinematics",
      subjectId: "sub-physics",
      title: "Kinematics in One Dimension",
      order: 1,
      description: "Displacement, velocity, acceleration, and equations of uniformly accelerated motion."
    },
    {
      id: "top-dynamics",
      subjectId: "sub-physics",
      title: "Dynamics & Newton\u2019s Laws",
      order: 2,
      description: "Force, inertia, mass, Newton\u2019s three laws of motion, and free-body diagrams."
    },
    // Chemistry
    {
      id: "top-atomic",
      subjectId: "sub-chemistry",
      title: "Atomic Structure & Isotopes",
      order: 1,
      description: "Subatomic particles, atomic number, mass number, isotopes, and relative atomic mass."
    },
    {
      id: "top-stoichiometry",
      subjectId: "sub-chemistry",
      title: "The Mole Concept & Stoichiometry",
      order: 2,
      description: "Avogadro\u2019s constant, molar mass, empirical formulas, and stoichiometric calculations."
    },
    // Biology
    {
      id: "top-cells",
      subjectId: "sub-biology",
      title: "Cell Structure & Organelles",
      order: 1,
      description: "Eukaryotic vs prokaryotic cells, organelle functions, and membrane boundaries."
    }
  ],
  concepts: [
    ...FURTHER_MATH_CONCEPTS,
    // Physics - Kinematics
    {
      id: "c-displacement-velocity",
      topicId: "top-kinematics",
      subjectId: "sub-physics",
      name: "Displacement, Velocity & Acceleration",
      explanation: "Displacement is the vector change in position (\u0394x). Velocity is the rate of change of displacement with respect to time (v = \u0394x/\u0394t). Acceleration is the rate of change of velocity (a = \u0394v/\u0394t). Uniform acceleration implies a constant rate of change in velocity over time.",
      definitions: [
        "Displacement: A vector quantity representing the shortest straight-line distance from an initial position to a final position with direction.",
        "Velocity: Vector rate of change of position, v = dx/dt.",
        "Acceleration: Vector rate of change of velocity, a = dv/dt."
      ],
      formulas: ["v = \u0394x / \u0394t", "a = \u0394v / \u0394t"],
      keyFacts: [
        "Speed is a scalar; velocity is a vector.",
        "Zero velocity does not necessarily imply zero acceleration (e.g., top of a vertical projectile trajectory)."
      ],
      examples: [
        "A runner completing one full 400m circular track lap has a distance of 400m but a displacement of 0m."
      ],
      sourceDocument: "Physics_Term1_OfficialNotes.pdf",
      sourcePage: 4,
      order: 1,
      prerequisiteConceptIds: []
    },
    {
      id: "c-suvat-equations",
      topicId: "top-kinematics",
      subjectId: "sub-physics",
      name: "Equations of Uniform Acceleration (SUVAT)",
      explanation: "When acceleration is strictly constant, motion can be resolved using the five kinematic variables: s (displacement), u (initial velocity), v (final velocity), a (acceleration), and t (time).",
      definitions: [
        "Uniform Acceleration: Motion where velocity changes at a constant rate over equal time increments."
      ],
      formulas: [
        "v = u + a*t",
        "s = u*t + 0.5*a*t^2",
        "v^2 = u^2 + 2*a*s",
        "s = 0.5*(u + v)*t"
      ],
      keyFacts: [
        "These equations are INVALID if acceleration varies with time or position.",
        "Direction conventions (+ and - signs) must remain consistent throughout every calculation."
      ],
      examples: [
        "A car braking from 20 m/s to rest at -4 m/s^2 takes t = (0 - 20)/(-4) = 5.0 seconds and travels s = 20(5) + 0.5(-4)(25) = 50 meters."
      ],
      sourceDocument: "Physics_Term1_OfficialNotes.pdf",
      sourcePage: 8,
      order: 2,
      prerequisiteConceptIds: ["c-displacement-velocity"]
    },
    // Physics - Dynamics
    {
      id: "c-newtons-second-law",
      topicId: "top-dynamics",
      subjectId: "sub-physics",
      name: "Newton\u2019s Second Law & Net Force",
      explanation: "The acceleration of an object of constant mass is directly proportional to the resultant net external force acting on it and inversely proportional to its mass. The acceleration is in the direction of the net force.",
      definitions: [
        "Resultant Force: The vector sum of all individual forces acting simultaneously on a body (\u03A3F).",
        "Newton: The SI unit of force; 1 N gives a 1 kg mass an acceleration of 1 m/s^2."
      ],
      formulas: ["\u03A3F = m * a"],
      keyFacts: [
        "If \u03A3F = 0, the body remains at rest or moves with constant velocity (Newton\u2019s 1st Law).",
        "Mass measures inertia (resistance to acceleration)."
      ],
      examples: [
        "A 5 kg crate pushed horizontally on frictionless ground with 15 N experiences a = 15/5 = 3 m/s^2."
      ],
      sourceDocument: "Physics_Term1_OfficialNotes.pdf",
      sourcePage: 15,
      order: 1,
      prerequisiteConceptIds: ["c-displacement-velocity"]
    },
    // Chemistry - Atomic Structure
    {
      id: "c-subatomic-particles",
      topicId: "top-atomic",
      subjectId: "sub-chemistry",
      name: "Subatomic Particles & Atomic Notation",
      explanation: "Atoms consist of a dense, positively charged nucleus containing protons and neutrons, surrounded by electrons in quantized energy levels. The atomic number (Z) defines the element by its proton count. The mass number (A) is the sum of protons and neutrons.",
      definitions: [
        "Proton: Positively charged nucleon (+1 charge, relative mass ~ 1 amu).",
        "Neutron: Neutral nucleon (0 charge, relative mass ~ 1 amu).",
        "Electron: Negatively charged subatomic particle (-1 charge, relative mass ~ 1/1836 amu).",
        "Atomic Number (Z): The number of protons in an atom\u2019s nucleus.",
        "Mass Number (A): Total number of nucleons (protons + neutrons)."
      ],
      formulas: ["A = Z + N (Neutrons = A - Z)"],
      keyFacts: [
        "In a neutral atom, number of electrons equals number of protons (Z).",
        "Chemical identity is determined strictly by the number of protons."
      ],
      examples: [
        "Carbon-14 has Z = 6 and A = 14, meaning 6 protons, 6 electrons, and 14 - 6 = 8 neutrons."
      ],
      sourceDocument: "Chemistry_Unit1_Notes.pdf",
      sourcePage: 2,
      order: 1,
      prerequisiteConceptIds: []
    },
    {
      id: "c-isotopes-relative-mass",
      topicId: "top-atomic",
      subjectId: "sub-chemistry",
      name: "Isotopes & Relative Atomic Mass (Ar)",
      explanation: "Isotopes are atoms of the same chemical element having the same number of protons (atomic number Z) but different numbers of neutrons (and therefore different mass numbers A). Relative atomic mass (Ar) is the weighted average mass of naturally occurring isotopes relative to 1/12th the mass of a Carbon-12 atom.",
      definitions: [
        "Isotopes: Forms of an element with identical atomic numbers but different mass numbers due to differing neutron counts.",
        "Relative Atomic Mass (Ar): The weighted average mass of atoms of an element compared with 1/12th of the mass of an atom of carbon-12."
      ],
      formulas: ["Ar = \u03A3 (isotope mass * percentage abundance) / 100"],
      keyFacts: [
        "Isotopes exhibit identical chemical properties because they have identical electron configurations.",
        "Physical properties (such as density and boiling point) can vary slightly due to differing mass."
      ],
      examples: [
        "Chlorine is 75% Cl-35 and 25% Cl-37. Ar = (35*75 + 37*25)/100 = 35.5."
      ],
      sourceDocument: "Chemistry_Unit1_Notes.pdf",
      sourcePage: 6,
      order: 2,
      prerequisiteConceptIds: ["c-subatomic-particles"]
    },
    // Chemistry - Stoichiometry
    {
      id: "c-mole-concept",
      topicId: "top-stoichiometry",
      subjectId: "sub-chemistry",
      name: "The Mole & Molar Mass",
      explanation: "The mole is the SI unit for amount of substance. One mole contains exactly 6.02214076 \xD7 10^23 elementary entities (Avogadro\u2019s constant, N_A). Molar mass (M) is the mass of one mole of a substance in g/mol.",
      definitions: [
        "Mole (mol): The amount of substance containing Avogadro\u2019s number of specified elementary entities.",
        "Avogadro Constant (N_A): 6.022 \xD7 10^23 particles per mole.",
        "Molar Mass (M): Mass in grams of 1 mole of a substance (g/mol)."
      ],
      formulas: ["n = m / M", "N = n * N_A"],
      keyFacts: [
        "Molar mass in g/mol is numerically equal to relative formula mass (Mr).",
        "Always check units when converting between mass (g) and moles (mol)."
      ],
      examples: [
        "Water (H2O) has M = 2(1.01) + 16.00 = 18.02 g/mol. In 36.04 g of water, n = 36.04 / 18.02 = 2.0 mol."
      ],
      sourceDocument: "Chemistry_Unit1_Notes.pdf",
      sourcePage: 12,
      order: 1,
      prerequisiteConceptIds: ["c-isotopes-relative-mass"]
    },
    // Biology - Cells
    {
      id: "c-eukaryote-prokaryote",
      topicId: "top-cells",
      subjectId: "sub-biology",
      name: "Prokaryotic vs Eukaryotic Cell Structure",
      explanation: "Prokaryotic cells (e.g. bacteria) lack a membrane-bound nucleus and membrane-bound organelles; their DNA is circular and floats freely in the nucleoid. Eukaryotic cells (plants, animals, fungi) feature a membrane-bound nucleus housing linear DNA organized with histones, and compartmentalized organelles.",
      definitions: [
        "Prokaryote: Unicellular organism lacking a membrane-enclosed nucleus or membrane-bound organelles.",
        "Eukaryote: Organism whose cells possess a membrane-bound nucleus and membrane-bound organelles (mitochondria, ER, Golgi)."
      ],
      formulas: [],
      keyFacts: [
        "Prokaryotes have 70S ribosomes; eukaryotes have 80S cytosolic ribosomes.",
        "Both cell types possess a plasma membrane, ribosomes, cytoplasm, and DNA."
      ],
      examples: [
        "Escherichia coli is prokaryotic (no nucleus, plasmid present); a human lymphocyte is eukaryotic (nucleus with chromatin, mitochondria present)."
      ],
      sourceDocument: "Biology_Cell_Structure_Notes.pdf",
      sourcePage: 3,
      order: 1,
      prerequisiteConceptIds: []
    }
  ],
  documents: [
    FURTHER_MATH_DOCUMENT,
    {
      id: "doc-physics",
      subjectId: "sub-physics",
      title: "Physics Term 1 Official Notes",
      filename: "Physics_Term1_OfficialNotes.pdf",
      pageCount: 32,
      uploadDate: (/* @__PURE__ */ new Date()).toISOString(),
      previewText: "Official school notes covering Classical Mechanics, Kinematics equations, and Newton\u2019s Laws of Motion."
    },
    {
      id: "doc-chemistry",
      subjectId: "sub-chemistry",
      title: "Chemistry Unit 1 Syllabus Notes",
      filename: "Chemistry_Unit1_Notes.pdf",
      pageCount: 28,
      uploadDate: (/* @__PURE__ */ new Date()).toISOString(),
      previewText: "Atomic structure, isotope mass spectroscopy, periodic trends, and mole stoichiometry equations."
    },
    {
      id: "doc-biology",
      subjectId: "sub-biology",
      title: "Biology Cell Structure Notes",
      filename: "Biology_Cell_Structure_Notes.pdf",
      pageCount: 22,
      uploadDate: (/* @__PURE__ */ new Date()).toISOString(),
      previewText: "Prokaryotic and eukaryotic ultrastructure, organelle compartmentalization, and membrane transport."
    }
  ],
  questions: [
    ...FURTHER_MATH_QUESTIONS,
    // Physics SUVAT Questions
    {
      id: "q-suvat-1",
      conceptId: "c-suvat-equations",
      subjectId: "sub-physics",
      topicId: "top-kinematics",
      category: "CALCULATION",
      type: "NUMERICAL",
      questionText: "A vehicle accelerates from rest at a constant rate of 3.0 m/s^2 along a straight highway for 6.0 seconds. Calculate its final velocity in m/s.",
      correctAnswer: "18",
      tolerance: 0.1,
      units: "m/s",
      explanation: "Using the kinematic equation v = u + at, with u = 0 m/s, a = 3.0 m/s^2, and t = 6.0 s: v = 0 + (3.0 * 6.0) = 18.0 m/s.",
      sourcePage: 8
    },
    {
      id: "q-suvat-2",
      conceptId: "c-suvat-equations",
      subjectId: "sub-physics",
      topicId: "top-kinematics",
      category: "APPLICATION",
      type: "MULTIPLE_CHOICE",
      questionText: "A ball is thrown vertically upwards into the air. At the highest point of its trajectory, what are its instantaneous velocity and acceleration (taking upward as positive, g = 9.8 m/s^2)?",
      options: [
        "Velocity = 0 m/s, Acceleration = 0 m/s^2",
        "Velocity = 0 m/s, Acceleration = -9.8 m/s^2",
        "Velocity = 9.8 m/s, Acceleration = 0 m/s^2",
        "Velocity = -9.8 m/s, Acceleration = -9.8 m/s^2"
      ],
      correctAnswer: "Velocity = 0 m/s, Acceleration = -9.8 m/s^2",
      explanation: "At the apex, the ball instantaneously stops changing position, so v = 0 m/s. However, gravity acts continuously downwards, so acceleration remains constant at -9.8 m/s^2.",
      sourcePage: 9
    },
    // Newton's Second Law
    {
      id: "q-newton-1",
      conceptId: "c-newtons-second-law",
      subjectId: "sub-physics",
      topicId: "top-dynamics",
      category: "CALCULATION",
      type: "NUMERICAL",
      questionText: "A net horizontal force of 45 N is applied to a box of mass 15 kg on a frictionless surface. What is the resulting acceleration in m/s^2?",
      correctAnswer: "3",
      tolerance: 0.05,
      units: "m/s^2",
      explanation: "From Newton\u2019s second law: a = \u03A3F / m = 45 N / 15 kg = 3.0 m/s^2.",
      sourcePage: 15
    },
    // Chemistry Isotopes
    {
      id: "q-isotopes-1",
      conceptId: "c-isotopes-relative-mass",
      subjectId: "sub-chemistry",
      topicId: "top-atomic",
      category: "RECALL",
      type: "MULTIPLE_CHOICE",
      questionText: "Why do two isotopes of the same element exhibit identical chemical behavior?",
      options: [
        "They contain the same number of neutrons in their nucleus",
        "They have the identical electron configuration and valence electrons",
        "They have identical atomic mass numbers (A)",
        "They have identical nuclear binding energy"
      ],
      correctAnswer: "They have the identical electron configuration and valence electrons",
      explanation: "Chemical bonding and reactions involve valence electrons. Because isotopes have the same atomic number (Z), neutral atoms have identical electron configurations and therefore identical chemical properties.",
      sourcePage: 6
    },
    {
      id: "q-isotopes-2",
      conceptId: "c-isotopes-relative-mass",
      subjectId: "sub-chemistry",
      topicId: "top-atomic",
      category: "CALCULATION",
      type: "NUMERICAL",
      questionText: "A sample of copper consists of 70% Cu-63 and 30% Cu-65. Calculate the relative atomic mass (Ar) of copper to one decimal place.",
      correctAnswer: "63.6",
      tolerance: 0.1,
      units: "amu",
      explanation: "Ar = (63 * 70 + 65 * 30) / 100 = (4410 + 1950) / 100 = 6360 / 100 = 63.6.",
      sourcePage: 7
    },
    // Chemistry Mole Concept
    {
      id: "q-mole-1",
      conceptId: "c-mole-concept",
      subjectId: "sub-chemistry",
      topicId: "top-stoichiometry",
      category: "CALCULATION",
      type: "NUMERICAL",
      questionText: "How many moles are present in 44.0 g of carbon dioxide (CO2)? (Molar mass of CO2 = 44.01 g/mol). Enter the number of moles to one decimal place.",
      correctAnswer: "1.0",
      tolerance: 0.05,
      units: "mol",
      explanation: "n = m / M = 44.0 g / 44.01 g/mol = 1.0 mol.",
      sourcePage: 12
    },
    // Biology Cell Structure
    {
      id: "q-cells-1",
      conceptId: "c-eukaryote-prokaryote",
      subjectId: "sub-biology",
      topicId: "top-cells",
      category: "RECOGNITION",
      type: "MULTIPLE_CHOICE",
      questionText: "Which structure is found in BOTH prokaryotic and eukaryotic cells?",
      options: [
        "Nuclear envelope",
        "Mitochondria",
        "Ribosomes",
        "Endoplasmic reticulum"
      ],
      correctAnswer: "Ribosomes",
      explanation: "Both prokaryotes (70S) and eukaryotes (80S) have ribosomes for protein synthesis. Prokaryotes lack membrane-bound organelles like mitochondria, nucleus, and endoplasmic reticulum.",
      sourcePage: 3
    }
  ],
  attempts: [],
  mistakes: [],
  mastery: {
    // Initial mastery records for all concepts
    "c-displacement-velocity": {
      conceptId: "c-displacement-velocity",
      subjectId: "sub-physics",
      topicId: "top-kinematics",
      score: 55,
      status: "LEARNING",
      lastPracticed: new Date(Date.now() - 864e5 * 3).toISOString(),
      nextReviewDue: new Date(Date.now() - 864e5).toISOString(),
      // Overdue
      intervalDays: 2,
      easeFactor: 2.5,
      repetitions: 2,
      consecutiveCorrect: 2,
      totalAttempts: 3,
      totalMistakes: 1
    },
    "c-suvat-equations": {
      conceptId: "c-suvat-equations",
      subjectId: "sub-physics",
      topicId: "top-kinematics",
      score: 30,
      status: "LEARNING",
      lastPracticed: new Date(Date.now() - 864e5 * 2).toISOString(),
      nextReviewDue: (/* @__PURE__ */ new Date()).toISOString(),
      // Due today
      intervalDays: 1,
      easeFactor: 2.4,
      repetitions: 1,
      consecutiveCorrect: 1,
      totalAttempts: 3,
      totalMistakes: 2
    },
    "c-newtons-second-law": {
      conceptId: "c-newtons-second-law",
      subjectId: "sub-physics",
      topicId: "top-dynamics",
      score: 0,
      status: "UNLEARNED",
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      consecutiveCorrect: 0,
      totalAttempts: 0,
      totalMistakes: 0
    },
    "c-subatomic-particles": {
      conceptId: "c-subatomic-particles",
      subjectId: "sub-chemistry",
      topicId: "top-atomic",
      score: 88,
      status: "MASTERED",
      lastPracticed: new Date(Date.now() - 864e5 * 5).toISOString(),
      nextReviewDue: new Date(Date.now() + 864e5 * 4).toISOString(),
      intervalDays: 9,
      easeFactor: 2.6,
      repetitions: 4,
      consecutiveCorrect: 4,
      totalAttempts: 5,
      totalMistakes: 0
    },
    "c-isotopes-relative-mass": {
      conceptId: "c-isotopes-relative-mass",
      subjectId: "sub-chemistry",
      topicId: "top-atomic",
      score: 42,
      status: "LEARNING",
      lastPracticed: new Date(Date.now() - 864e5 * 1).toISOString(),
      nextReviewDue: (/* @__PURE__ */ new Date()).toISOString(),
      // Due today
      intervalDays: 1,
      easeFactor: 2.3,
      repetitions: 1,
      consecutiveCorrect: 1,
      totalAttempts: 2,
      totalMistakes: 1
    },
    "c-mole-concept": {
      conceptId: "c-mole-concept",
      subjectId: "sub-chemistry",
      topicId: "top-stoichiometry",
      score: 0,
      status: "UNLEARNED",
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      consecutiveCorrect: 0,
      totalAttempts: 0,
      totalMistakes: 0
    },
    "c-eukaryote-prokaryote": {
      conceptId: "c-eukaryote-prokaryote",
      subjectId: "sub-biology",
      topicId: "top-cells",
      score: 0,
      status: "UNLEARNED",
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      consecutiveCorrect: 0,
      totalAttempts: 0,
      totalMistakes: 0
    }
  },
  dailyPlans: {},
  testRecords: [],
  settings: {
    termStartDate: "2026-09-01",
    termEndDate: "2026-12-18",
    targetStudyMinutesPerDay: 90,
    masteryThreshold: 85,
    onboardingCompleted: true
  }
};
SEED_DATA.mistakes.push({
  id: "m-initial-1",
  questionId: "q-suvat-2",
  conceptId: "c-suvat-equations",
  topicId: "top-kinematics",
  subjectId: "sub-physics",
  conceptName: "Equations of Uniform Acceleration (SUVAT)",
  questionText: "A ball is thrown vertically upwards into the air. At the highest point of its trajectory, what are its instantaneous velocity and acceleration (taking upward as positive, g = 9.8 m/s^2)?",
  studentAnswer: "Velocity = 0 m/s, Acceleration = 0 m/s^2",
  correctAnswer: "Velocity = 0 m/s, Acceleration = -9.8 m/s^2",
  mistakeType: "MISCONCEPTION",
  diagnosis: "Confused instantaneous zero velocity with zero acceleration. Gravity never stops exerting a downward force (F = mg) on an airborne projectile, regardless of whether its velocity momentarily passes through zero at the turning point.",
  targetedRemediation: "Remember Newton\u2019s 2nd Law: a = \u03A3F/m. As long as gravity acts on the ball, acceleration remains non-zero (-g) throughout the flight.",
  timestamp: new Date(Date.now() - 864e5).toISOString(),
  resolved: false,
  resolutionAttempts: 0,
  nextReviewDate: (/* @__PURE__ */ new Date()).toISOString()
});
var StorageManager = class {
  constructor() {
    this.isBatching = false;
    this.syncReady = Promise.resolve();
    this.pendingSync = Promise.resolve();
    this.lastSyncedAt = "";
    this.ensureDataDir();
    this.db = this.loadDatabase();
    this.syncReady = this.initSupabaseSync();
  }
  /** Resolves once the initial Supabase state has loaded. */
  ready() {
    return this.syncReady;
  }
  /** Resolves once any in-flight Supabase write has finished (serverless hosts must await this before responding). */
  flush() {
    return this.pendingSync;
  }
  /** Serverless: pull newer state written by another instance. */
  async refresh() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      const head = await supabase.from("app_state").select("updated_at").eq("key", "main_db").single();
      const remote = head.data?.updated_at;
      if (!remote || this.lastSyncedAt && new Date(remote).getTime() === new Date(this.lastSyncedAt).getTime()) return;
      const full = await supabase.from("app_state").select("data, updated_at").eq("key", "main_db").single();
      if (!full.error && full.data?.data && Array.isArray(full.data.data.subjects)) {
        this.db = full.data.data;
        this.lastSyncedAt = full.data.updated_at;
      }
    } catch (err) {
      console.warn("Supabase refresh failed:", this.cleanErrorMessage(err?.message || err));
    }
  }
  /** Full copy of the current state, used to roll back a failed rebuild. */
  snapshot() {
    return JSON.stringify(this.db);
  }
  restore(snapshot) {
    this.db = JSON.parse(snapshot);
  }
  // Lesson sessions are stored so they survive restarts and serverless invocations.
  getSession(id) {
    return this.db.sessions?.[id];
  }
  saveSession(session) {
    if (!this.db.sessions) this.db.sessions = {};
    this.db.sessions[session.sessionId] = session;
    const ids = Object.keys(this.db.sessions);
    if (ids.length > 25) ids.slice(0, ids.length - 25).forEach((k) => delete this.db.sessions[k]);
    this.persist();
  }
  startBatch() {
    this.isBatching = true;
  }
  endBatch() {
    this.isBatching = false;
    this.persist();
  }
  ensureDataDir() {
    if (!import_fs.default.existsSync(DATA_DIR)) {
      import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    }
  }
  loadDatabase() {
    let data = SEED_DATA;
    try {
      if (import_fs.default.existsSync(DB_FILE)) {
        const raw = import_fs.default.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.subjects)) {
          data = parsed;
        } else {
          data = SEED_DATA;
          this.saveDatabase(SEED_DATA);
        }
      } else {
        this.saveDatabase(SEED_DATA);
      }
    } catch (e) {
      console.warn("Could not read existing database.json, keeping current state:", e);
      data = SEED_DATA;
      this.saveDatabase(SEED_DATA);
    }
    if (!data.mastery) data.mastery = {};
    for (const c of data.concepts || []) {
      if (!data.mastery[c.id]) {
        data.mastery[c.id] = {
          conceptId: c.id,
          subjectId: c.subjectId,
          topicId: c.topicId,
          score: 0,
          status: "UNLEARNED",
          intervalDays: 1,
          easeFactor: 2.5,
          repetitions: 0,
          consecutiveCorrect: 0,
          totalAttempts: 0,
          totalMistakes: 0
        };
      }
    }
    return data;
  }
  cleanErrorMessage(msg) {
    if (!msg) return "Unknown error";
    const str = typeof msg === "string" ? msg : JSON.stringify(msg);
    if (str.includes("<!DOCTYPE") || str.includes("<html") || str.includes("<body")) {
      const titleMatch = str.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        return `Cloudflare/HTTP Error: ${titleMatch[1].trim()} (HTML Response)`;
      }
      return "Cloudflare/HTTP Network Error (HTML Response / Gateway Timeout / 520)";
    }
    return str;
  }
  async initSupabaseSync() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from("app_state").select("data").eq("key", "main_db").single();
      if (!error && data?.data && Array.isArray(data.data.subjects)) {
        console.log("\u2705 Synchronized state from Supabase Cloud Database.");
        this.db = data.data;
        this.saveDatabase(this.db);
      } else if (error) {
        console.warn("Supabase sync warning on startup:", this.cleanErrorMessage(error.message || error));
      } else {
        console.log("Pushing initial local database state to Supabase Cloud Database...");
        await supabase.from("app_state").upsert({ key: "main_db", data: this.db, updated_at: (/* @__PURE__ */ new Date()).toISOString() });
      }
    } catch (err) {
      console.warn("Supabase sync error on startup:", this.cleanErrorMessage(err?.message || err));
    }
  }
  saveDatabase(data) {
    try {
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write database.json:", e);
    }
    const supabase = getSupabaseClient();
    if (supabase) {
      this.pendingSync = (async () => {
        try {
          const stamp = (/* @__PURE__ */ new Date()).toISOString();
          this.lastSyncedAt = stamp;
          const { error } = await supabase.from("app_state").upsert({ key: "main_db", data, updated_at: stamp });
          if (error) {
            console.warn("Supabase background sync error:", this.cleanErrorMessage(error.message));
          }
        } catch (err) {
          console.warn("Supabase background sync failed:", this.cleanErrorMessage(err?.message || err));
        }
      })();
    }
  }
  getSupabaseStatus() {
    const url = process.env.SUPABASE_URL || null;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || null;
    return {
      configured: Boolean(url && key),
      url
    };
  }
  getDatabase() {
    return this.db;
  }
  persist() {
    if (this.isBatching) return;
    this.saveDatabase(this.db);
  }
  // Subjects
  getSubjects() {
    return this.db.subjects;
  }
  getSubject(id) {
    return this.db.subjects.find((s) => s.id === id);
  }
  addSubject(subject) {
    this.db.subjects.push(subject);
    this.persist();
  }
  deleteSubject(subjectId) {
    this.db.subjects = this.db.subjects.filter((s) => s.id !== subjectId);
    const topicIdsToRemove = new Set(
      this.db.topics.filter((t) => t.subjectId === subjectId).map((t) => t.id)
    );
    this.db.topics = this.db.topics.filter((t) => t.subjectId !== subjectId);
    const conceptIdsToRemove = new Set(
      this.db.concepts.filter((c) => c.subjectId === subjectId).map((c) => c.id)
    );
    this.db.concepts = this.db.concepts.filter((c) => c.subjectId !== subjectId);
    this.db.questions = this.db.questions.filter((q) => q.subjectId !== subjectId);
    this.db.documents = this.db.documents.filter((d) => d.subjectId !== subjectId);
    this.db.mistakes = this.db.mistakes.filter((m) => m.subjectId !== subjectId);
    this.db.testRecords = this.db.testRecords.filter((tr) => tr.subjectId !== subjectId);
    for (const cid of conceptIdsToRemove) {
      delete this.db.mastery[cid];
    }
    this.persist();
  }
  deleteTopic(topicId) {
    this.db.topics = this.db.topics.filter((t) => t.id !== topicId);
    const conceptIdsToRemove = new Set(
      this.db.concepts.filter((c) => c.topicId === topicId).map((c) => c.id)
    );
    this.db.concepts = this.db.concepts.filter((c) => c.topicId !== topicId);
    this.db.questions = this.db.questions.filter((q) => q.topicId !== topicId);
    this.db.mistakes = this.db.mistakes.filter((m) => m.topicId !== topicId);
    for (const cid of conceptIdsToRemove) {
      delete this.db.mastery[cid];
    }
    this.persist();
  }
  deleteConcept(conceptId) {
    this.db.concepts = this.db.concepts.filter((c) => c.id !== conceptId);
    this.db.questions = this.db.questions.filter((q) => q.conceptId !== conceptId);
    this.db.mistakes = this.db.mistakes.filter((m) => m.conceptId !== conceptId);
    delete this.db.mastery[conceptId];
    this.persist();
  }
  deleteDocument(documentId) {
    this.db.documents = this.db.documents.filter((d) => d.id !== documentId);
    this.persist();
  }
  deleteMistake(mistakeId) {
    this.db.mistakes = this.db.mistakes.filter((m) => m.id !== mistakeId);
    this.persist();
  }
  clearAll() {
    this.db = {
      subjects: [],
      topics: [],
      concepts: [],
      documents: [],
      questions: [],
      attempts: [],
      mistakes: [],
      mastery: {},
      dailyPlans: {},
      testRecords: [],
      settings: {
        termStartDate: "2026-09-01",
        termEndDate: "2026-12-18",
        targetStudyMinutesPerDay: 60,
        masteryThreshold: 85,
        onboardingCompleted: true
      }
    };
    this.persist();
  }
  // Topics
  getTopics(subjectId) {
    if (subjectId) {
      return this.db.topics.filter((t) => t.subjectId === subjectId);
    }
    return this.db.topics;
  }
  addTopic(topic) {
    this.db.topics.push(topic);
    this.persist();
  }
  // Concepts
  getConcepts(topicId, subjectId) {
    let list = this.db.concepts;
    if (subjectId) {
      list = list.filter((c) => c.subjectId === subjectId);
    }
    if (topicId) {
      list = list.filter((c) => c.topicId === topicId);
    }
    return list;
  }
  getConcept(id) {
    return this.db.concepts.find((c) => c.id === id);
  }
  addConcept(concept) {
    this.db.concepts.push(concept);
    if (!this.db.mastery[concept.id]) {
      this.db.mastery[concept.id] = {
        conceptId: concept.id,
        subjectId: concept.subjectId,
        topicId: concept.topicId,
        score: 0,
        status: "UNLEARNED",
        intervalDays: 1,
        easeFactor: 2.5,
        repetitions: 0,
        consecutiveCorrect: 0,
        totalAttempts: 0,
        totalMistakes: 0
      };
    }
    this.persist();
  }
  // Documents
  getDocuments(subjectId) {
    if (subjectId) {
      return this.db.documents.filter((d) => d.subjectId === subjectId);
    }
    return this.db.documents;
  }
  addDocument(doc) {
    this.db.documents.push(doc);
    this.persist();
  }
  // Questions
  getQuestions(conceptId) {
    if (conceptId) {
      return this.db.questions.filter((q) => q.conceptId === conceptId);
    }
    return this.db.questions;
  }
  getQuestion(id) {
    return this.db.questions.find((q) => q.id === id);
  }
  addQuestion(question) {
    this.db.questions.push(question);
    this.persist();
  }
  // Attempts
  recordAttempt(attempt) {
    this.db.attempts.push(attempt);
    this.persist();
  }
  getAttempts(conceptId) {
    if (conceptId) {
      return this.db.attempts.filter((a) => a.conceptId === conceptId);
    }
    return this.db.attempts;
  }
  // Mistakes
  getMistakes(resolved) {
    if (resolved !== void 0) {
      return this.db.mistakes.filter((m) => m.resolved === resolved);
    }
    return this.db.mistakes;
  }
  addMistake(mistake) {
    this.db.mistakes.push(mistake);
    this.persist();
  }
  resolveMistake(id) {
    const item = this.db.mistakes.find((m) => m.id === id);
    if (item) {
      item.resolved = true;
      this.persist();
    }
  }
  incrementMistakeAttempt(id, wasSuccess) {
    const item = this.db.mistakes.find((m) => m.id === id);
    if (item) {
      item.resolutionAttempts += 1;
      if (wasSuccess && item.resolutionAttempts >= 2) {
        item.resolved = true;
      }
      this.persist();
    }
  }
  // Mastery
  getMastery(conceptId) {
    return this.db.mastery[conceptId];
  }
  getAllMastery() {
    return this.db.mastery;
  }
  updateMastery(mastery) {
    this.db.mastery[mastery.conceptId] = mastery;
    this.persist();
  }
  // Tests
  getTestRecords() {
    return this.db.testRecords;
  }
  recordTest(test) {
    this.db.testRecords.push(test);
    this.persist();
  }
  // Plans
  getDailyPlan(dateStr) {
    return this.db.dailyPlans[dateStr];
  }
  saveDailyPlan(plan) {
    this.db.dailyPlans[plan.date] = plan;
    this.persist();
  }
  togglePlanItem(dateStr, itemId) {
    const plan = this.db.dailyPlans[dateStr];
    if (plan) {
      const item = plan.items.find((i) => i.id === itemId);
      if (item) {
        item.completed = !item.completed;
        plan.completedMinutes = plan.items.filter((i) => i.completed).reduce((sum, cur) => sum + cur.estimatedMinutes, 0);
        this.persist();
      }
    }
  }
  // Settings
  getSettings() {
    if (!this.db.settings) {
      this.db.settings = {
        termStartDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        termEndDate: new Date(Date.now() + 90 * 24 * 3600 * 1e3).toISOString().split("T")[0],
        targetStudyMinutesPerDay: 120,
        masteryThreshold: 80,
        onboardingCompleted: false
      };
    }
    return this.db.settings;
  }
  updateSettings(partialSettings) {
    const current = this.getSettings();
    this.db.settings = { ...current, ...partialSettings };
    this.persist();
    return this.db.settings;
  }
  // Reset curriculum for fresh onboarding
  resetCurriculum() {
    this.db.subjects = [];
    this.db.topics = [];
    this.db.concepts = [];
    this.db.documents = [];
    this.db.questions = [];
    this.db.attempts = [];
    this.db.mistakes = [];
    this.db.mastery = {};
    this.db.dailyPlans = {};
    this.db.testRecords = [];
    if (this.db.settings) {
      this.db.settings.onboardingCompleted = false;
    }
    this.persist();
  }
  // Reset to seed if requested
  resetToSeed() {
    this.db = JSON.parse(JSON.stringify(SEED_DATA));
    this.persist();
  }
};
var storage = new StorageManager();

// server/ai/geminiProvider.ts
var import_genai = require("@google/genai");

// server/ai/jsonHelper.ts
function safeParseJson(raw, fallback) {
  if (!raw || typeof raw !== "string") return fallback !== void 0 ? fallback : {};
  let text = raw.trim();
  text = text.replace(/^[\s\S]*?```(?:json)?\s*/i, "");
  if (text.includes("```")) {
    text = text.replace(/\s*```[\s\S]*$/i, "");
  }
  try {
    return JSON.parse(text);
  } catch {
  }
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  if (firstBrace === -1 && firstBracket === -1) {
    if (fallback !== void 0) return fallback;
    throw new Error("No valid JSON structure found in response");
  }
  let isObject = true;
  let startIdx = firstBrace;
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    isObject = false;
    startIdx = firstBracket;
  }
  const endChar = isObject ? "}" : "]";
  const lastIdx = text.lastIndexOf(endChar);
  if (lastIdx > startIdx) {
    let candidate = text.slice(startIdx, lastIdx + 1);
    candidate = candidate.replace(/,\s*([\}\]])/g, "$1");
    try {
      return JSON.parse(candidate);
    } catch {
    }
  }
  if (fallback !== void 0) return fallback;
  throw new Error("Failed to parse AI JSON response: " + text.slice(0, 120));
}

// server/services/aiCurriculumUnderstanding.ts
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var AICurriculumUnderstandingService = class {
  /**
   * Main entry point:
   * Uses a Two-Phase Blueprint & Focused Topic Extraction Architecture:
   * Phase 1: Reads the Scheme of Work / Syllabus / Document Headers to extract the global Blueprint (Topics & Page Boundaries).
   * Phase 2: Systematically executes a focused extraction for EACH Topic, guaranteeing 100% granular concept extraction
   *          (every hormone, cell type, organ, definition, equation, and comparison table).
   */
  async buildCurriculum(input, aiClient, isRateLimited = false) {
    const rawText = input.text || "";
    const cleanText = this.normalizePageMarkers(rawText);
    const subjectName = input.subjectHint || "Academic Course";
    if (aiClient && !isRateLimited) {
      try {
        const aiResult = await this.understandWithTwoPhaseAI(cleanText, subjectName, aiClient);
        if (aiResult && aiResult.topics && aiResult.topics.length > 0) {
          return aiResult;
        }
      } catch (err) {
        console.warn("AI curriculum understanding failed, switching to semantic fallback engine:", err);
      }
    }
    return this.compileCurriculumSemantically(cleanText, subjectName);
  }
  /**
   * Two-Phase AI Extraction Engine
   */
  async understandWithTwoPhaseAI(text, subjectHint, ai) {
    const pageMap = this.extractPageMap(text);
    const totalPages = pageMap.size;
    const blueprint = await this.extractSyllabusBlueprint(text, subjectHint, ai, pageMap);
    if (!blueprint || blueprint.topics.length === 0) {
      return this.processWindowedChunks(text, subjectHint, ai);
    }
    console.log(`[AICurriculum] Blueprint discovered ${blueprint.topics.length} topics. Beginning Phase 2 deep topic extraction...`);
    const extractedTopics = [];
    const batchSize = 3;
    for (let i = 0; i < blueprint.topics.length; i += batchSize) {
      const currentBatch = blueprint.topics.slice(i, i + batchSize);
      const batchPromises = currentBatch.map(async (topicBp) => {
        try {
          const topicText = this.getTopicContent(pageMap, topicBp.startPage, topicBp.endPage, text);
          if (!topicText || topicText.trim().length < 80) return null;
          const topicResult = await this.extractTopicDeepConcepts(topicBp, topicText, ai, topicBp.startPage || 1);
          return topicResult;
        } catch (err) {
          console.warn(`Deep extraction failed for topic ${topicBp.title}, using semantic fallback for topic:`, err?.message || err);
          return null;
        }
      });
      const batchResults = await Promise.all(batchPromises);
      for (const res of batchResults) {
        if (res && res.concepts && res.concepts.length > 0) {
          extractedTopics.push(res);
        }
      }
      if (i + batchSize < blueprint.topics.length) {
        await sleep(300);
      }
    }
    if (extractedTopics.length === 0) {
      return this.processWindowedChunks(text, subjectHint, ai);
    }
    return {
      topics: extractedTopics,
      inferredSubject: blueprint.subject || subjectHint
    };
  }
  /**
   * Phase 1: Extracts the Document Syllabus Blueprint (Topics and Subtopics from Scheme of Work / Headings)
   */
  async extractSyllabusBlueprint(fullText, subjectHint, ai, pageMap) {
    let openingText = "";
    const sortedPages = Array.from(pageMap.keys()).sort((a, b) => a - b);
    for (const pNum of sortedPages) {
      if (pNum <= 3 || openingText.length < 8e3) {
        openingText += `=== PAGE ${pNum} ===
${pageMap.get(pNum) || ""}

`;
      }
    }
    let headingSummaries = "";
    for (const [pNum, content] of pageMap.entries()) {
      const lines = content.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
      const possibleHeadings = lines.slice(0, 4).filter(
        (l) => /^(week|topic|chapter|unit|section|lesson|1\.|2\.|3\.|4\.|5\.|6\.|7\.|8\.|9\.|10\.)/i.test(l) || l === l.toUpperCase()
      );
      if (possibleHeadings.length > 0) {
        headingSummaries += `Page ${pNum}: ${possibleHeadings.slice(0, 2).join(" | ")}
`;
      }
    }
    const prompt = `You are a senior curriculum architect and syllabus designer.
Analyze the opening Scheme of Work / Syllabus and the page headings from the school notes.

Extract the complete list of academic Topics, their syllabus subtopic points, and their starting and ending page numbers.

Syllabus Context: ${subjectHint || "Academic Course"}

DOCUMENT SCHEME OF WORK & OPENING PAGES:
"""
${openingText}
"""

DOCUMENT PAGE HEADINGS & BOUNDARIES:
"""
${headingSummaries}
"""

CRITICAL BOUNDARY AND DOMAIN RULES:
- You MUST only extract topics and subtopics that are ACTUALLY present and discussed in the provided school notes text.
- NEVER copy the illustrative example placeholder topics (like "Sexual Reproduction", "Conjugation", "Spirogyra", "Vertebrate Reproductive Systems") into your output unless they are explicitly present in the provided school notes.
- If the notes are about Further Mathematics, you MUST extract Further Mathematics topics (e.g., Indices, Logarithms, Surds, Sets, Vectors, AP/GP, etc.) found in the text.
- If the notes are about Agricultural Science, you MUST extract Agricultural Science topics.
- DO NOT mix up subjects. It is a critical failure to output "Sexual Reproduction" or any biology topics under a Mathematics, Physics, or Economics syllabus.
- Clean and normalize all extracted topic titles to be accurate to the notes, avoiding noisy, short, or generic terms (never use titles like "= 104" or "Chapter One").

OUTPUT SCHEMA (JSON ONLY):
{
  "subject": "Clean Academic Subject (e.g. Senior Secondary Biology)",
  "topics": [
    {
      "title": "Clean Academic Topic Name (e.g. Indices and Exponential Functions)",
      "description": "Pedagogical overview of this topic",
      "syllabusSubtopics": [
        "First subtopic or law",
        "Second subtopic or application"
      ],
      "startPage": 2,
      "endPage": 5
    }
  ]
}

Return ONLY valid JSON.`;
    const models = ["gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.5-flash"];
    for (const model of models) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: [{ text: prompt }],
          config: { responseMimeType: "application/json", temperature: 0.1 }
        });
        const parsed = safeParseJson(res.text || "{}", null);
        if (parsed && Array.isArray(parsed.topics) && parsed.topics.length > 0) {
          const validTopics = parsed.topics.filter((t) => !this.isAdministrativeTitle(t.title)).map((t, idx) => ({
            title: this.cleanAcademicName(t.title || `Topic ${idx + 1}`),
            description: t.description || "",
            syllabusSubtopics: Array.isArray(t.syllabusSubtopics) ? t.syllabusSubtopics : [],
            startPage: typeof t.startPage === "number" ? t.startPage : 1,
            endPage: typeof t.endPage === "number" ? t.endPage : sortedPages[sortedPages.length - 1] || 1
          }));
          if (validTopics.length > 0) {
            return {
              subject: parsed.subject || subjectHint,
              topics: validTopics
            };
          }
        }
      } catch (err) {
        console.warn("Blueprint extraction attempt failed on model", model, err);
      }
    }
    return { subject: subjectHint, topics: [] };
  }
  /**
   * Phase 2: Deep, exhaustive extraction for a single specific Topic.
   */
  async extractTopicDeepConcepts(topicBp, topicNotesText, ai, basePage) {
    const subtopicHints = topicBp.syllabusSubtopics.length > 0 ? `Syllabus Subtopics to Cover & Decompose:
${topicBp.syllabusSubtopics.map((s) => `- ${s}`).join("\n")}` : "Cover all relevant subtopics present in the notes.";
    const prompt = `You are an elite academic professor and master teacher.
Perform a 100% EXHAUSTIVE CONCEPT EXTRACTION for the following topic:

Topic: ${topicBp.title}
${subtopicHints}

LESSON NOTES (Pages ${topicBp.startPage || basePage} to ${topicBp.endPage || basePage}):
"""
${topicNotesText}
"""

CRITICAL DOMAIN MATCHING RULES:
- You MUST only extract concepts that are ACTUALLY present and discussed in the provided lesson notes text for the topic "${topicBp.title}".
- DO NOT copy the illustrative examples (like "Sexual Reproduction", "Sperm Cell", "Testes", etc.) into your output. Extract concepts strictly from the provided text.
- Clean and normalize all concept names, ensuring they are professional, concise, and accurate (never use titles like "= 104" or "Chapter One" or "Content").

CRITICAL ZERO-OMISSION & LATEX FORMATTING RULES:
1. ANY and ALL mathematical notation, formulas, equations, variables, symbols, fractions, superscripts, subscripts, units, or chemical expressions MUST be written in valid LaTeX delimiters:
   - Use '$ ... $' for inline math expressions (e.g. '$x^2 + y^2 = r^2$', 'a/b as \\frac{a}{b}', '\\theta').
   - Use '$$ ... $$' for standalone equations or multi-line derivations.
   - NEVER output plain ASCII math like 'x^2' or 'a/b' or '1/2' without LaTeX delimiters.
2. Extract EVERY SINGLE teachable concept, definition, anatomical structure, physiological mechanism, organ, tissue, cell type, hormone, developmental stage, law, formula, and comparison table.
3. DO NOT SUMMARIZE MULTIPLE CONCEPTS INTO ONE. Every distinct sub-bullet or paragraph topic MUST be an individual Concept entry.
   - Example 1: In Sexual Reproduction -> extract "Definition of Sexual Reproduction", "Conjugation in Spirogyra and Paramecium", "Fusion of Gametes (Syngamy)", "Structure & Anatomy of Sperm Cell (Head, Acrosome, Middle Piece, Tail)", "Hormones in Spermatogenesis (FSH, LH, Androgen/Testosterone, Leydig Cells)", "Structure of Ovum (Vitelline Membrane, Zona Pellucida, Corona Radiata)", "Differences Between Male and Female Gametes", "Zygote Cleavage & Morula Formation", "Blastocyst Formation & Implantation".
   - Example 2: In Vertebrate Reproduction -> extract "Testes and Scrotum Thermoregulation", "Seminiferous Tubules and Sertoli Cells", "Epididymis and Vas Deferens", "Male Accessory Glands (Seminal Vesicles, Prostate, Cowper's Gland)", "Ovaries and Oogenesis", "Fallopian Tubes (Infundibulum, Fimbriae)", "Uterus and Endometrium", "Embryonic Membranes (Yolk Sac, Amnion, Chorion, Allantois)", "Placenta and Umbilical Cord Functions", "Differences Between Male and Female Reproductive Systems", "Reproductive System in Reptiles (Agama Lizard)", "Reproductive System in Bony Fish (Tilapia)".
3. For each concept:
   - Provide a clear 2-4 sentence pedagogical explanation synthesizing how it works.
   - Extract exact formal syllabus definitions.
   - Extract any chemical formulas or equations if present.
   - List key examinable facts, organs, hormones, or rules.
   - Record the exact sourcePage where it is taught.

OUTPUT SCHEMA (JSON ONLY):
{
  "title": "${this.cleanAcademicName(topicBp.title)}",
  "description": "Comprehensive pedagogical overview of ${this.cleanAcademicName(topicBp.title)}",
  "subtopics": [
    {
      "title": "Clean Subtopic Name",
      "description": "Subtopic overview"
    }
  ],
  "concepts": [
    {
      "name": "Specific Concept Name",
      "subtopicTitle": "Matching Subtopic Name",
      "explanation": "Clear 2-4 sentence instructional explanation from the notes",
      "definitions": ["Formal definition"],
      "formulas": ["Equation/Formula if any"],
      "keyFacts": ["Key Fact 1", "Key Fact 2"],
      "examples": ["Example organism or application"],
      "sourcePage": ${topicBp.startPage || basePage},
      "prerequisites": []
    }
  ]
}

Return ONLY valid JSON.`;
    const models = ["gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.5-flash"];
    for (const model of models) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const res = await ai.models.generateContent({
            model,
            contents: [{ text: prompt }],
            config: { responseMimeType: "application/json", temperature: 0.1 }
          });
          const rawText = res.text || "{}";
          const parsed = safeParseJson(rawText, null);
          if (parsed && Array.isArray(parsed.concepts) && parsed.concepts.length > 0) {
            const validConcepts = parsed.concepts.filter((c) => !this.isAdministrativeTitle(c.name)).map((c, cIdx) => ({
              name: this.cleanAcademicName(c.name || `Concept ${cIdx + 1}`),
              subtopicTitle: this.cleanAcademicName(c.subtopicTitle || parsed.subtopics?.[0]?.title || "Core Principles"),
              explanation: c.explanation || `Comprehensive instructional coverage of ${c.name}.`,
              definitions: Array.isArray(c.definitions) ? c.definitions : [],
              formulas: Array.isArray(c.formulas) ? c.formulas : [],
              keyFacts: Array.isArray(c.keyFacts) ? c.keyFacts : [],
              examples: Array.isArray(c.examples) ? c.examples : [],
              sourcePage: typeof c.sourcePage === "number" ? c.sourcePage : basePage,
              prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites : [],
              sampleQuestions: []
            }));
            const subtopics = (parsed.subtopics || []).filter((st) => !this.isAdministrativeTitle(st.title)).map((st) => ({
              title: this.cleanAcademicName(st.title || "Core Principles"),
              description: st.description || ""
            }));
            if (subtopics.length === 0) {
              subtopics.push({ title: "Core Principles", description: `Fundamental principles of ${topicBp.title}` });
            }
            return {
              title: this.cleanAcademicName(parsed.title || topicBp.title),
              description: parsed.description || topicBp.description || `Curriculum module covering ${topicBp.title}.`,
              subtopics,
              concepts: validConcepts
            };
          }
        } catch (err) {
          const errMsg = (err?.message || String(err)).toLowerCase();
          const isTransient = errMsg.includes("503") || errMsg.includes("unavailable") || errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("resource_exhausted") || errMsg.includes("overloaded");
          if (isTransient && attempt === 1) {
            await sleep(600);
            continue;
          }
          break;
        }
      }
    }
    return null;
  }
  /**
   * Helper: Extracts text belonging to a topic based on start and end page
   */
  getTopicContent(pageMap, startPage = 1, endPage = 1, fullText) {
    if (pageMap.size === 0) return fullText;
    let content = "";
    const actualEnd = Math.max(startPage, endPage);
    for (let p = startPage; p <= actualEnd; p++) {
      if (pageMap.has(p)) {
        content += `=== PAGE ${p} ===
${pageMap.get(p)}

`;
      }
    }
    return content.trim() || fullText;
  }
  /**
   * Helper: Parses page numbers into a Map<pageNum, text>
   */
  extractPageMap(text) {
    const pageMap = /* @__PURE__ */ new Map();
    const pages = text.split(/===\s*PAGE\s*(\d+)\s*===/gi);
    if (pages.length > 1) {
      let curPage = 1;
      for (let i = 1; i < pages.length; i += 2) {
        curPage = parseInt(pages[i], 10) || curPage;
        const body = (pages[i + 1] || "").trim();
        pageMap.set(curPage, body);
      }
    } else {
      pageMap.set(1, text);
    }
    return pageMap;
  }
  /**
   * Windowed chunk processing fallback
   */
  async processWindowedChunks(text, subjectHint, ai) {
    const pageChunks = this.splitIntoPageChunks(text, 2);
    const validChunks = pageChunks.filter((chunk) => chunk.text.length >= 120);
    const chunkResults = [];
    const batchSize = 3;
    for (let i = 0; i < validChunks.length; i += batchSize) {
      const currentBatch = validChunks.slice(i, i + batchSize);
      const batchPromises = currentBatch.map(async (chunk) => {
        try {
          const mockTopicBp = {
            title: `Module (Pages ${chunk.startPage}-${chunk.endPage})`,
            syllabusSubtopics: [],
            startPage: chunk.startPage,
            endPage: chunk.endPage
          };
          const res = await this.extractTopicDeepConcepts(mockTopicBp, chunk.text, ai, chunk.startPage);
          if (res && res.concepts && res.concepts.length > 0) {
            return {
              topics: [res],
              inferredSubject: subjectHint
            };
          }
        } catch (chunkErr) {
          console.warn(`Chunk fallback error for pages ${chunk.startPage}-${chunk.endPage}:`, chunkErr);
        }
        return this.compileChunkSemantically(chunk.text, subjectHint, chunk.startPage);
      });
      const results = await Promise.all(batchPromises);
      for (const r of results) {
        if (r && r.topics && r.topics.length > 0) {
          chunkResults.push(r);
        }
      }
    }
    return this.reconcileCurriculumChunks(chunkResults, subjectHint);
  }
  /**
   * Ensures consistent === PAGE n === markers across raw text.
   */
  normalizePageMarkers(text) {
    let normalized = text.replace(/[^\x20-\x7E\r\n\t\u00A0-\uFFFF]/g, " ").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    normalized = normalized.replace(/\[PAGE\s*(\d+)\]/gi, "=== PAGE $1 ===");
    if (!normalized.includes("=== PAGE")) {
      if (normalized.includes("\f")) {
        const pages = normalized.split("\f");
        normalized = pages.map((p, idx) => `=== PAGE ${idx + 1} ===
${p}`).join("\n\n");
      } else {
        normalized = `=== PAGE 1 ===
${normalized}`;
      }
    }
    return normalized.trim();
  }
  /**
   * Identifies whether a candidate title is administrative noise.
   */
  isAdministrativeTitle(title) {
    if (!title) return true;
    const clean = title.trim();
    const lower = clean.toLowerCase();
    if (clean.length < 4) return true;
    if (!/[a-zA-Z]/.test(clean)) return true;
    if (clean.includes("=") || clean.includes("+") || clean.includes("\u221A") || clean.includes("^")) {
      if (/[\+\-\*\/\=\<\>\√\^]/.test(clean)) {
        return true;
      }
    }
    return lower.includes("school") || lower.includes("scheme of work") || lower.includes("behavioral objective") || lower.includes("behavioural objective") || lower.includes("learning objective") || lower.includes("lesson note") || lower.includes("first term") || lower.includes("second term") || lower.includes("third term") || lower.includes("attracting children") || lower.includes("returning leaders") || lower.includes("reference materials") || lower.includes("textbook") || lower.includes("reference book") || lower.includes("table of contents") || lower.includes("content") || lower === "contents" || lower === "example" || lower === "examples" || lower === "solution" || lower === "solutions" || lower === "chapter" || lower.includes("chapter ") || lower.includes("p a g e") || lower.includes("page ") || /^week\s*\d+/i.test(lower) || /^lesson\s*\d+/i.test(lower) || /^page\s*\d+/i.test(lower) || /^chapter\s*[a-z0-9]+/i.test(lower) || /^topic\s*\d+/i.test(lower) || /^unit\s*\d+/i.test(lower) || /^section\s*\d+/i.test(lower) || /^\d+\s*\|\s*p\s*a\s*g\s*e/i.test(lower) || /^\d+\s*p\s*a\s*g\s*e/i.test(lower);
  }
  /**
   * Reconciles multiple windowed extraction outputs into a unified curriculum.
   */
  reconcileCurriculumChunks(chunks, subjectHint) {
    const allTopics = chunks.flatMap((c) => c.topics);
    const mergedMap = /* @__PURE__ */ new Map();
    for (const t of allTopics) {
      if (this.isAdministrativeTitle(t.title)) continue;
      const normalizedKey = this.normalizeTopicKey(t.title);
      const subtopics = Array.isArray(t.subtopics) ? t.subtopics : [];
      const concepts = Array.isArray(t.concepts) ? t.concepts : [];
      if (!mergedMap.has(normalizedKey)) {
        mergedMap.set(normalizedKey, {
          title: t.title,
          description: t.description,
          subtopics: [...subtopics],
          concepts: [...concepts]
        });
      } else {
        const existing = mergedMap.get(normalizedKey);
        for (const st of subtopics) {
          if (this.isAdministrativeTitle(st.title)) continue;
          const existingSt = existing.subtopics.find(
            (s) => s.title.toLowerCase().trim() === st.title.toLowerCase().trim()
          );
          if (!existingSt) {
            existing.subtopics.push(st);
          }
        }
        for (const c of concepts) {
          if (this.isAdministrativeTitle(c.name)) continue;
          const existingC = existing.concepts.find(
            (ec) => ec.name.toLowerCase().trim() === c.name.toLowerCase().trim()
          );
          if (!existingC) {
            existing.concepts.push(c);
          }
        }
      }
    }
    return {
      topics: Array.from(mergedMap.values()),
      inferredSubject: chunks[0]?.inferredSubject || subjectHint
    };
  }
  /**
   * Normalizes topic titles for semantic matching
   */
  normalizeTopicKey(title) {
    return title.toLowerCase().replace(/^(topic|chapter|unit|module|week)\s*\d+[:\.\-\s]*/gi, "").replace(/^(the|an|a)\s+/gi, "").replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  }
  /**
   * Splits long text by page markers for batched window processing.
   */
  splitIntoPageChunks(text, pagesPerChunk = 2) {
    const pageMarkerRegex = /===\s*PAGE\s*(\d+)\s*===/gi;
    const matches = [...text.matchAll(pageMarkerRegex)];
    if (matches.length === 0) {
      return [{ startPage: 1, endPage: 1, text }];
    }
    const chunks = [];
    for (let i = 0; i < matches.length; i += pagesPerChunk) {
      const sliceMatches = matches.slice(i, i + pagesPerChunk);
      const startMatch = sliceMatches[0];
      const nextBatchFirstMatch = matches[i + pagesPerChunk];
      const startPage = parseInt(startMatch[1], 10);
      const endPage = parseInt(sliceMatches[sliceMatches.length - 1][1], 10);
      const startIndex = startMatch.index;
      const endIndex = nextBatchFirstMatch ? nextBatchFirstMatch.index : text.length;
      chunks.push({
        startPage,
        endPage,
        text: text.slice(startIndex, endIndex).trim()
      });
    }
    return chunks;
  }
  compileChunkSemantically(chunkText, subjectHint, basePage) {
    return this.compileCurriculumSemantically(chunkText, subjectHint);
  }
  /**
   * High-quality content-driven semantic compiler fallback
   */
  compileCurriculumSemantically(text, subjectHint) {
    const pages = text.split(/===\s*PAGE\s*(\d+)\s*===/gi);
    const pageEntries = [];
    if (pages.length > 1) {
      let curPage = 1;
      for (let i = 1; i < pages.length; i += 2) {
        curPage = parseInt(pages[i], 10) || curPage;
        const body = (pages[i + 1] || "").trim();
        if (body) {
          pageEntries.push({ pageNum: curPage, content: body });
        }
      }
    } else {
      pageEntries.push({ pageNum: 1, content: text });
    }
    const topics = [];
    const pageSize = Math.max(1, Math.ceil(pageEntries.length / 5));
    for (let i = 0; i < pageEntries.length; i += pageSize) {
      const chunkPages = pageEntries.slice(i, i + pageSize);
      const startPage = chunkPages[0]?.pageNum || 1;
      const endPage = chunkPages[chunkPages.length - 1]?.pageNum || startPage;
      const concepts = [];
      for (const p of chunkPages) {
        const lines = p.content.split("\n").map((l) => l.trim()).filter((l) => l.length > 5 && l.length < 70 && !this.isAdministrativeTitle(l));
        for (const line of lines.slice(0, 5)) {
          const cleanName = this.cleanAcademicName(line);
          if (cleanName && !concepts.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
            concepts.push({
              name: cleanName,
              subtopicTitle: `Core Principles of ${subjectHint}`,
              explanation: `Instructional coverage of ${cleanName} for ${subjectHint} (Page ${p.pageNum}).`,
              definitions: [`Standard principle and definition for ${cleanName}.`],
              formulas: [],
              keyFacts: [`Key examinable fact from page ${p.pageNum}.`],
              examples: [],
              sourcePage: p.pageNum,
              prerequisites: [],
              sampleQuestions: []
            });
          }
        }
      }
      if (concepts.length > 0) {
        topics.push({
          title: `${subjectHint} - Module ${topics.length + 1} (Pages ${startPage}-${endPage})`,
          description: `Syllabus module covering curriculum topics for ${subjectHint}.`,
          subtopics: [{ title: "Core Principles", description: `Fundamental concepts in ${subjectHint}` }],
          concepts: concepts.slice(0, 10)
        });
      }
    }
    return {
      topics: topics.length > 0 ? topics : [
        {
          title: `${subjectHint} Syllabus Overview`,
          description: `Core instructional principles for ${subjectHint}.`,
          subtopics: [{ title: "General Principles", description: "Core course concepts" }],
          concepts: [
            {
              name: `Introduction to ${subjectHint}`,
              subtopicTitle: "General Principles",
              explanation: `Foundational concepts and principles for ${subjectHint}.`,
              definitions: [`Standard foundational concept for ${subjectHint}.`],
              formulas: [],
              keyFacts: [],
              examples: [],
              sourcePage: 1,
              prerequisites: [],
              sampleQuestions: []
            }
          ]
        }
      ],
      inferredSubject: subjectHint
    };
  }
  /**
   * Cleans raw text into normalized, student-friendly academic title case.
   */
  cleanAcademicName(raw) {
    let clean = raw.replace(/^[=•\-\*:\s\d\.\(\)\+]+/, "").replace(/[:\.\s=]+$/, "").replace(/\s+/g, " ").trim();
    if (clean === clean.toUpperCase() && clean.length > 2) {
      clean = clean.toLowerCase().split(" ").map((word) => {
        if (["and", "or", "of", "in", "to", "for", "the", "a", "an", "on", "at", "by"].includes(word)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(" ");
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return clean;
  }
};
var aiCurriculumUnderstandingService = new AICurriculumUnderstandingService();

// server/services/pdfExtractor.ts
var import_pdf_parse = require("pdf-parse");
async function extractTextFromPdfBuffer(buffer) {
  try {
    const parser = new import_pdf_parse.PDFParse({ data: buffer });
    const result = await parser.getText();
    if (result && Array.isArray(result.pages) && result.pages.length > 0) {
      const formatted = result.pages.map((p, idx) => `=== PAGE ${p.num || idx + 1} ===
${p.text || ""}`).join("\n\n");
      return {
        text: formatted,
        pageCount: result.total || result.pages.length
      };
    }
    if (result && typeof result.text === "string" && result.text.trim()) {
      return {
        text: result.text,
        pageCount: result.total || 1
      };
    }
  } catch (err) {
    console.warn("PDFParse instance getText failed, trying direct function call fallback:", err);
  }
  try {
    const legacy = import_pdf_parse.PDFParse;
    if (typeof legacy === "function") {
      const data = await legacy(buffer);
      let outText = data.text || "";
      if (!outText.includes("=== PAGE") && outText.includes("\f")) {
        const pages = outText.split("\f");
        outText = pages.map((p, idx) => `=== PAGE ${idx + 1} ===
${p}`).join("\n\n");
      }
      return {
        text: outText,
        pageCount: data.numpages || 1
      };
    }
  } catch (legacyErr) {
    console.warn("Legacy pdf-parse call failed:", legacyErr);
  }
  return { text: "", pageCount: 0 };
}

// server/services/questionUtils.ts
function shuffleQuestionOptions(q) {
  if (!q || !Array.isArray(q.options) || q.options.length <= 1) {
    return q;
  }
  const cleanCorrect = (q.correctAnswer || "").trim();
  let cleanOptions = q.options.map((opt) => (opt || "").trim()).filter((opt) => opt.length > 0);
  const exists = cleanOptions.some((opt) => opt.toLowerCase() === cleanCorrect.toLowerCase());
  if (!exists && cleanCorrect.length > 0) {
    cleanOptions[0] = cleanCorrect;
  }
  const shuffled = [...cleanOptions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return {
    ...q,
    options: shuffled
  };
}
function isCalculationSubject(subjectName, formulas) {
  if (formulas && formulas.length > 0 && formulas.some((f) => f && f.trim().length > 0)) {
    return true;
  }
  if (!subjectName) return false;
  const lower = subjectName.toLowerCase();
  return lower.includes("math") || lower.includes("calculus") || lower.includes("algebra") || lower.includes("physics") || lower.includes("arithmetic") || lower.includes("statistics") || lower.includes("geometry") || lower.includes("accounting");
}
function generateSubjectAwareFallbackQuestion(concept, category, difficulty = "MEDIUM") {
  const subjectName = concept.subjectName || concept.subjectId || "Academic Subject";
  const isMath = isCalculationSubject(subjectName, concept.formulas);
  const correctText = (category === "RECALL" ? concept.definitions?.[0] || concept.formulas?.[0] : null) || concept.keyFacts?.[0] || (category === "RECALL" ? concept.formulas?.[0] : null) || `Systematically analyze variables, apply standard properties, and enforce all boundary constraints.`;
  let questionText = "";
  let distractors = [];
  if (category === "RECALL") {
    questionText = `According to the official ${subjectName} notes, what is the core principle or definition for ${concept.name}?`;
    if (isMath) {
      distractors = [
        `Inverting the terms to form a reciprocal relationship without altering sign`,
        `Summing arbitrary terms regardless of base compatibility`,
        `Equating the variable to 1 under all boundary conditions`
      ];
    } else {
      distractors = [
        `Conflating ${concept.name} with an alternative ${subjectName} process or unrelated classification`,
        `Applying general definitions without accounting for specific ${subjectName} environmental or structural conditions`,
        `Disregarding standard nomenclature and regulatory guidelines established in the notes`
      ];
    }
  } else {
    questionText = `In a standard ${subjectName} examination scenario testing ${concept.name}, which statement or procedure is correct?`;
    if (isMath) {
      distractors = [
        `Multiply powers when terms with equal bases are being added`,
        `Omit the sign alteration during reciprocal transformations`,
        `Disregard fractional powers during polynomial division`
      ];
    } else {
      distractors = [
        `Confusing primary cause and effect mechanisms or structural stages in ${concept.name}`,
        `Applying general principles without verifying initial syllabus preconditions for ${subjectName}`,
        `Overlooking key environmental, physiological, or contextual factors specific to ${concept.name}`
      ];
    }
  }
  const rawOptions = [correctText, ...distractors];
  const distractorDiagnoses = {
    [distractors[0]]: "MISCONCEPTION",
    [distractors[1]]: "KNOWLEDGE_GAP",
    [distractors[2]]: "CARELESS_ERROR"
  };
  return shuffleQuestionOptions({
    category,
    type: "MULTIPLE_CHOICE",
    questionText,
    options: rawOptions,
    correctAnswer: correctText,
    explanation: `Verified from official ${subjectName} syllabus notes for ${concept.name}: ${concept.explanation ? concept.explanation.slice(0, 160) : "Standard course principle."}`,
    distractorDiagnoses,
    sourcePage: concept.sourcePage || 1
  });
}
function parseNumeric(input) {
  if (input === void 0 || input === null) return null;
  let s = String(input).trim().toLowerCase().replace(/(\d),(?=\d{3}(\D|$))/g, "$1");
  const sci = s.match(/^(-?\d*\.?\d+)\s*(?:x|\u00d7|\*)\s*10\s*\^\s*\{?(-?\d+)\}?/);
  if (sci) return parseFloat(sci[1]) * Math.pow(10, parseInt(sci[2], 10));
  const frac = s.match(/^(-?\d*\.?\d+)\s*\/\s*(-?\d*\.?\d+)/);
  if (frac && parseFloat(frac[2]) !== 0) return parseFloat(frac[1]) / parseFloat(frac[2]);
  const m = s.match(/^[^\d\-+.]*([-+]?\d*\.?\d+(?:e[-+]?\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}
function numericMatches(student, expected, tolerance) {
  const a = parseNumeric(student);
  const b = parseNumeric(expected);
  if (a === null || b === null || !isFinite(a) || !isFinite(b)) return null;
  const tol = typeof tolerance === "number" && tolerance >= 0 ? tolerance : Math.max(Math.abs(b) * 0.015, 1e-9);
  return Math.abs(a - b) <= tol + 1e-12;
}
var STOP_WORDS = /* @__PURE__ */ new Set(["the", "and", "for", "with", "that", "this", "from", "are", "was", "were", "which", "into", "their", "have", "has", "can", "not", "but", "its", "than", "then", "also", "when", "what", "how", "why", "who", "about", "between", "because", "such", "each", "they", "them", "these", "those", "will", "would", "could", "should", "been", "being", "more", "most", "some", "any"]);
var tokens = (s) => (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
function keywordOverlap(student, ...references) {
  const ref = new Set(references.flatMap(tokens));
  if (ref.size === 0) return 0;
  const got = new Set(tokens(student));
  let hit = 0;
  ref.forEach((w) => {
    if (got.has(w)) hit++;
  });
  return hit / ref.size;
}

// server/ai/geminiProvider.ts
var sleep2 = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var GeminiProvider = class {
  constructor() {
    this.name = "Google Gemini Adaptive Multi-Model";
    this.aiClient = null;
    this.rateLimitedUntil = 0;
    this.teachingCache = /* @__PURE__ */ new Map();
    this.questionCache = /* @__PURE__ */ new Map();
  }
  getClient() {
    if (!this.aiClient && process.env.GEMINI_API_KEY) {
      this.aiClient = new import_genai.GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
    return this.aiClient;
  }
  isRateLimited() {
    return Date.now() < this.rateLimitedUntil;
  }
  handleRateLimitOrUnavailable(err) {
    let delayMs = 15e3;
    try {
      const errStr = typeof err === "string" ? err : JSON.stringify(err);
      const match = errStr.match(/retry in\s+(\d+(?:\.\d+)?)s/i) || errStr.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
      if (match && match[1]) {
        delayMs = Math.ceil(parseFloat(match[1]) * 1e3) + 1e3;
      }
    } catch {
    }
    this.rateLimitedUntil = Math.max(this.rateLimitedUntil, Date.now() + delayMs);
  }
  async generateWithModelFallback(params) {
    const client = this.getClient();
    if (!client) throw new Error("Gemini API client not initialized");
    if (this.isRateLimited()) {
      const remainingSec = Math.ceil((this.rateLimitedUntil - Date.now()) / 1e3);
      throw new Error(`Gemini rate limit cooldown active (${remainingSec}s remaining)`);
    }
    const models = params.candidateModels || [
      "gemini-3.1-flash-lite",
      "gemini-3.6-flash",
      "gemini-3.7-flash",
      "gemini-3.5-flash"
    ];
    let lastError = null;
    for (const model of models) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const res = await client.models.generateContent({
            model,
            contents: params.contents,
            config: params.config
          });
          if (res && res.text) {
            return { text: res.text };
          }
        } catch (err) {
          lastError = err;
          const errMsg = (err?.message || String(err)).toLowerCase();
          const isQuota = errMsg.includes("429") || errMsg.includes("resource_exhausted") || errMsg.includes("quota exceeded") || errMsg.includes("rate limit");
          const isUnavailable = errMsg.includes("503") || errMsg.includes("unavailable") || errMsg.includes("high demand") || errMsg.includes("overloaded");
          if ((isQuota || isUnavailable) && attempt === 1) {
            await sleep2(600);
            continue;
          }
          if (attempt === 2) {
            break;
          }
        }
      }
    }
    if (lastError) {
      this.handleRateLimitOrUnavailable(lastError);
    }
    throw lastError || new Error("All candidate Gemini models failed");
  }
  /**
   * AI-Driven Curriculum Understanding:
   * 1. Extracts complete text while preserving page markers (=== PAGE n ===)
   * 2. Passes full instructional material directly to Gemini AI
   * 3. AI understands the educational content and creates the Topic -> Subtopic -> Concept hierarchy
   * 4. AI generates clean normalized names, student-friendly summaries, and measurable concepts
   */
  async extractCurriculum(subjectName, notesText, pdfBuffer) {
    let fullText = notesText || "";
    if (!fullText && pdfBuffer) {
      try {
        const parsedPdf = await extractTextFromPdfBuffer(pdfBuffer);
        fullText = parsedPdf.text || "";
      } catch (err) {
        console.warn("PDF text extraction fallback failed:", err);
      }
    }
    const client = this.getClient();
    return aiCurriculumUnderstandingService.buildCurriculum(
      {
        text: fullText,
        subjectHint: subjectName
      },
      client || void 0,
      this.isRateLimited()
    );
  }
  /**
   * Real AI teaching grounded in school notes.
   * Generates intuitive explanation, rules, examples, and misconceptions to avoid.
   */
  async generateTeaching(concept, sourceNotesText, studentMastery) {
    const cacheKey = `teaching-${concept.id}`;
    if (this.teachingCache.has(cacheKey)) {
      return this.teachingCache.get(cacheKey);
    }
    const client = this.getClient();
    if (!client || this.isRateLimited()) {
      const fallback = this.fallbackGenerateTeaching(concept);
      this.teachingCache.set(cacheKey, fallback);
      return fallback;
    }
    try {
      const prompt = `You are an expert, calm academic tutor.
The student needs to master this concept from their official school notes.
DO NOT just regurgitate the raw notes. Synthesize a clean, intuitive, rigorous teaching module.

CRITICAL MATHEMATICAL NOTATION MANDATE:
ALL mathematical notation, formulas, equations, variables, symbols, fractions, powers, roots, or chemical expressions MUST BE WRITTEN IN VALID LaTeX DELIMITERS:
- Use inline math '$ ... $' for inline variables, symbols, and formulas (e.g. '$x^2 + y^2 = r^2$', '\\frac{a}{b}', '\\theta', '\\text{H}_2\\text{O}').
- Use block math '$$ ... $$' for standalone equations.
- NEVER output plain ASCII math like 'x^2' or 'a/b' without LaTeX delimiters.

Concept: ${concept.name}
Subject: ${concept.subjectName || concept.subjectId}
Definitions: ${concept.definitions?.join("; ") || "None provided"}
Formulas: ${concept.formulas?.join("; ") || "None"}
Key Facts: ${concept.keyFacts?.join("; ") || "None"}
Student Current Mastery: ${studentMastery !== void 0 ? `${studentMastery}%` : "Beginning"}
Source Notes Excerpt:
"""
${(sourceNotesText || concept.explanation || "").slice(0, 3500)}
"""

Structure your response in valid JSON with:
1. title: Engaging, clear academic heading
2. explanation: Core intuitive explanation explaining the "why" and "how". Use concise paragraphs and bold emphasis where helpful.
3. importantRules: Array of 2-4 critical rules, conditions, or formulas.
4. simpleExamples: Array of 2 clear worked examples with step-by-step working.
5. commonMisconceptions: Array of 1-3 items, each having "mistake" (what students erroneously do) and "clarification" (why it's wrong and how to think correctly).
6. sourceNoteReference: { "documentName": "${concept.sourceDocument || "School Syllabus Notes"}", "page": ${concept.sourcePage || 1} }

Return ONLY valid JSON:
{
  "title": "string",
  "explanation": "string",
  "importantRules": ["string"],
  "simpleExamples": ["string"],
  "commonMisconceptions": [
    { "mistake": "string", "clarification": "string" }
  ],
  "sourceNoteReference": {
    "documentName": "string",
    "page": number
  }
}`;
      const response = await this.generateWithModelFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
      const parsed = safeParseJson(response.text, {});
      if (parsed.explanation && Array.isArray(parsed.importantRules)) {
        this.teachingCache.set(cacheKey, parsed);
        return parsed;
      }
      const fallback = this.fallbackGenerateTeaching(concept);
      this.teachingCache.set(cacheKey, fallback);
      return fallback;
    } catch {
      const fallback = this.fallbackGenerateTeaching(concept);
      this.teachingCache.set(cacheKey, fallback);
      return fallback;
    }
  }
  /**
   * Generates a dynamic, concept-appropriate question based on cognitive category & difficulty.
   */
  async generateQuestion(concept, category, difficulty, previousMistakes, sourceNotesText) {
    const cacheKey = `q-${concept.id}-${category}-${difficulty}`;
    if (this.questionCache.has(cacheKey)) {
      return this.questionCache.get(cacheKey);
    }
    const client = this.getClient();
    if (!client || this.isRateLimited()) {
      const fallback = this.fallbackGenerateQuestion(concept, category, difficulty);
      this.questionCache.set(cacheKey, fallback);
      return fallback;
    }
    try {
      const prompt = `You are an academic examination specialist.
CRITICAL MATHEMATICAL NOTATION MANDATE:
ALL mathematical notation, formulas, equations, variables, symbols, fractions, powers, roots, or chemical expressions MUST BE WRITTEN IN VALID LaTeX DELIMITERS:
- Use inline math '$ ... $' for inline variables, symbols, options, and formulas (e.g. '$x^2 + y^2 = r^2$', '\\frac{a}{b}', '\\theta').
- Use block math '$$ ... $$' for standalone equations.
- NEVER output plain ASCII math like 'x^2' or 'a/b' without LaTeX delimiters.

Generate an original, rigorous question for:
Concept: ${concept.name}
Subject: ${concept.subjectName || concept.subjectId}
Category: ${category}
Difficulty: ${difficulty}
Rules/Formulas: ${concept.formulas?.join("; ") || "None"}
Definitions: ${concept.definitions?.join("; ") || "None"}
Previous mistakes student made to probe: ${previousMistakes?.join("; ") || "None"}
School Notes Excerpt:
"""
${(sourceNotesText || concept.explanation || "").slice(0, 2500)}
"""

Requirements:
- Ensure all question stems, correct answers, and distractors are strictly tailored to the subject "${concept.subjectName || concept.subjectId}". DO NOT use math/algebra terminology or mathematical examples unless the subject is actually Mathematics or Physics.
- NEVER spoon-feed or explicitly reveal formulas in the question stem or options. For instance, do NOT write "Using the formula A = ...". For APPLICATION questions, you are strictly forbidden from writing the formula or mathematical relation needed to solve it. The student must independently recall or deduce the necessary formula or principle from memory to solve the problem. Only in RECALL questions can a formula be named or asked to be identified.
- Provide 4 plausible options. The 3 distractors MUST represent genuine subject-specific misconceptions or mistakes.
- Place the correct answer randomly among the options (or populate options and correctAnswer clearly).
- For each distractor, map its diagnosis to: "MISCONCEPTION", "CALCULATION_ERROR", "KNOWLEDGE_GAP", or "CARELESS_ERROR".
- Provide a rigorous explanation grounded in the school notes.

Return ONLY valid JSON:
{
  "category": "${category}",
  "type": "MULTIPLE_CHOICE",
  "questionText": "Clear question stem",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": "Exact string matching one of the options",
  "explanation": "Detailed explanation...",
  "distractorDiagnoses": {
    "Distractor 1": "MISCONCEPTION",
    "Distractor 2": "CALCULATION_ERROR",
    "Distractor 3": "KNOWLEDGE_GAP"
  },
  "sourcePage": ${concept.sourcePage || 1}
}`;
      const response = await this.generateWithModelFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });
      const parsed = safeParseJson(response.text, {});
      if (parsed.questionText && parsed.correctAnswer) {
        const shuffled = shuffleQuestionOptions(parsed);
        this.questionCache.set(cacheKey, shuffled);
        return shuffled;
      }
      const fallback = this.fallbackGenerateQuestion(concept, category, difficulty);
      this.questionCache.set(cacheKey, fallback);
      return fallback;
    } catch {
      const fallback = this.fallbackGenerateQuestion(concept, category, difficulty);
      this.questionCache.set(cacheKey, fallback);
      return fallback;
    }
  }
  /**
   * Generates targeted remediation when a student makes a mistake.
   */
  async generateRemediation(concept, question, studentAnswer, diagnosisType) {
    const client = this.getClient();
    if (!client) {
      return this.fallbackGenerateRemediation(concept, question, studentAnswer, diagnosisType);
    }
    try {
      const prompt = `You are an academic remediation specialist.
ALL mathematical notation, formulas, equations, variables, symbols, fractions, powers, roots, or chemical expressions MUST BE WRITTEN IN VALID LaTeX DELIMITERS ($ ... $ or $$ ... $$).

A student just answered a question incorrectly.
Concept: ${concept.name}
Question: ${question.questionText}
Student Answer: "${studentAnswer}"
Correct Model Answer: "${question.correctAnswer}"
Diagnosed Failure Type: "${diagnosisType}"

Provide a targeted remediation that fixes their mental model:
1. title: Specific targeted title (e.g. "Rule Distinction: Powers vs Multipliers")
2. mentalModelCorrection: Directly explain why their thought process failed without being condescending.
3. contrastingExample: Show a side-by-side contrast (What went wrong vs What is correct).
4. actionableStep: 1 clear actionable memory rule or checklist to apply right now.

Return ONLY valid JSON:
{
  "title": "string",
  "mentalModelCorrection": "string",
  "contrastingExample": "string",
  "actionableStep": "string"
}`;
      const response = await this.generateWithModelFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
      const parsed = safeParseJson(response.text, {});
      if (parsed.mentalModelCorrection && parsed.actionableStep) {
        return parsed;
      }
      return this.fallbackGenerateRemediation(concept, question, studentAnswer, diagnosisType);
    } catch (err) {
      console.warn("Gemini generateRemediation fallback used:", err);
      return this.fallbackGenerateRemediation(concept, question, studentAnswer, diagnosisType);
    }
  }
  async generateLesson(concept, sourceNotesText) {
    const client = this.getClient();
    if (!client) {
      return this.fallbackGenerateLesson(concept);
    }
    try {
      const prompt = `You are a rigorous, calm, note-grounded academic tutor.
CRITICAL MATHEMATICAL NOTATION MANDATE:
ALL mathematical notation, formulas, equations, variables, symbols, fractions, powers, roots, or chemical expressions MUST BE WRITTEN IN VALID LaTeX DELIMITERS:
- Use inline math '$ ... $' for inline variables, symbols, options, and formulas (e.g. '$x^2 + y^2 = r^2$', '\\frac{a}{b}', '\\theta').
- Use block math '$$ ... $$' for standalone equations.
- NEVER output plain ASCII math like 'x^2' or 'a/b' without LaTeX delimiters.

Teach the following concept from the student's school curriculum:
Subject: ${concept.subjectId}
Concept: ${concept.name}
Definitions: ${concept.definitions.join("; ")}
Formulas: ${concept.formulas.join("; ")}
Key Facts: ${concept.keyFacts.join("; ")}
Official Notes Context: ${sourceNotesText ? sourceNotesText.slice(0, 3e3) : concept.explanation}

Rules:
1. Do NOT write an enormous lecture. Keep each step focused and readable.
2. Follow this 4-step sequence:
   Step 1: EXPLANATION (Core principles, physical intuition, or logical definitions)
   Step 2: EXAMPLE (Clear worked example demonstrating how the concept works)
   Step 3: CHECK_QUESTION (An active recall/recognition check to see if the student grasps the fundamental idea)
   Step 4: APPLICATION_QUESTION (A problem or scenario requiring the student to apply the concept)

Return ONLY valid JSON matching this structure:
{
  "steps": [
    {
      "stepNumber": 1,
      "type": "EXPLANATION",
      "content": "Grounded explanation text..."
    },
    {
      "stepNumber": 2,
      "type": "EXAMPLE",
      "content": "Worked example step by step..."
    },
    {
      "stepNumber": 3,
      "type": "CHECK_QUESTION",
      "content": "Quick comprehension check question prompt",
      "question": {
        "category": "RECALL",
        "type": "MULTIPLE_CHOICE",
        "questionText": "...",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "...",
        "explanation": "..."
      }
    },
    {
      "stepNumber": 4,
      "type": "APPLICATION_QUESTION",
      "content": "Real application check question prompt",
      "question": {
        "category": "APPLICATION",
        "type": "MULTIPLE_CHOICE",
        "questionText": "...",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "...",
        "explanation": "..."
      }
    }
  ]
}`;
      const response = await this.generateWithModelFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
      const parsed = safeParseJson(response.text, {});
      if (parsed.steps && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
        return parsed;
      }
      return this.fallbackGenerateLesson(concept);
    } catch (err) {
      console.warn("Gemini lesson generation fallback used:", err);
      return this.fallbackGenerateLesson(concept);
    }
  }
  async evaluateOpenAnswer(question, studentAnswer, concept, sourceNotesText) {
    const client = this.getClient();
    if (!client) {
      return this.fallbackEvaluateAnswer(question, studentAnswer);
    }
    try {
      const prompt = `You are an objective academic examiner.
ALL mathematical notation, formulas, equations, variables, symbols, fractions, powers, roots, or chemical expressions in your feedback and targeted remediation MUST BE WRITTEN IN VALID LaTeX DELIMITERS ($ ... $ or $$ ... $$).

Evaluate the student's answer to this open-ended question:
Question: "${question.questionText}"
Concept: "${concept.name}"
Model/Correct Answer: "${question.correctAnswer}"
Student Answer: "${studentAnswer}"
Official Context: "${sourceNotesText || concept.explanation}"

Determine:
1. Is it substantially correct? (Score between 0.0 and 1.0)
2. Accurate, constructive feedback explaining what was correct and what was missing.
3. If score < 0.75, classify the mistake:
   - KNOWLEDGE_GAP (didn't know an essential fact or terminology)
   - MISCONCEPTION (confused principles or stated an incorrect theory)
   - RECALL_FAILURE (could not recall a required term or formula)
   - CALCULATION_ERROR (math computation slipped)
   - MISREAD (answered something different from what was asked)
   - CARELESS_ERROR (minor omission or typo)
   - APPLICATION_FAILURE (knows definition but applied it backwards)
4. Pinpoint the exact diagnosis and 1-sentence targeted remediation.

Return ONLY valid JSON:
{
  "isCorrect": boolean,
  "score": number, // 0.0 to 1.0
  "feedback": "string",
  "mistakeType": "KNOWLEDGE_GAP" | "MISCONCEPTION" | "RECALL_FAILURE" | "CALCULATION_ERROR" | "MISREAD" | "CARELESS_ERROR" | "APPLICATION_FAILURE",
  "diagnosis": "string explaining root error",
  "targetedRemediation": "string with specific actionable rule"
}`;
      const response = await this.generateWithModelFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });
      const parsed = safeParseJson(response.text, {});
      return {
        isCorrect: Boolean(parsed.isCorrect && parsed.score >= 0.75),
        score: typeof parsed.score === "number" ? parsed.score : 0.5,
        feedback: parsed.feedback || "Answer reviewed against school curriculum standards.",
        mistakeType: parsed.mistakeType,
        diagnosis: parsed.diagnosis,
        targetedRemediation: parsed.targetedRemediation
      };
    } catch (err) {
      return this.fallbackEvaluateAnswer(question, studentAnswer);
    }
  }
  async diagnoseMistake(question, studentAnswer, concept) {
    const client = this.getClient();
    if (!client) {
      return {
        mistakeType: "MISCONCEPTION",
        diagnosis: `The provided response "${studentAnswer}" does not align with the standard answer "${question.correctAnswer}".`,
        remediation: `Review the foundational principle of ${concept.name}.`
      };
    }
    try {
      const prompt = `Analyze this student mistake:
Concept: ${concept.name}
Question: ${question.questionText}
Student Answer: ${studentAnswer}
Expected Answer: ${question.correctAnswer}
Explanation: ${question.explanation}

Classify into one of: KNOWLEDGE_GAP, MISCONCEPTION, RECALL_FAILURE, CALCULATION_ERROR, MISREAD, CARELESS_ERROR, APPLICATION_FAILURE.
Provide a clear 1-sentence diagnosis and a 1-sentence targeted remediation rule.

Return ONLY valid JSON:
{
  "mistakeType": "...",
  "diagnosis": "...",
  "remediation": "..."
}`;
      const response = await this.generateWithModelFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });
      const parsed = safeParseJson(response.text, {});
      return {
        mistakeType: parsed.mistakeType || "MISCONCEPTION",
        diagnosis: parsed.diagnosis || "The response diverged from the verified school solution.",
        remediation: parsed.remediation || question.explanation
      };
    } catch {
      return {
        mistakeType: "MISCONCEPTION",
        diagnosis: `The answer "${studentAnswer}" diverges from "${question.correctAnswer}".`,
        remediation: question.explanation
      };
    }
  }
  // --- DETERMINISTIC FALLBACKS (Guarantees zero downtime even with no API key) ---
  fallbackGenerateLesson(concept) {
    return {
      steps: [
        {
          stepNumber: 1,
          type: "EXPLANATION",
          content: `${concept.explanation}

Key definitions:
${concept.definitions.map((d) => `\u2022 ${d}`).join("\n")}`
        },
        {
          stepNumber: 2,
          type: "EXAMPLE",
          content: `Standard Worked Example:
${concept.examples.length > 0 ? concept.examples.join("\n\n") : "Applying the core definition to a standard examination case."}`
        },
        {
          stepNumber: 3,
          type: "CHECK_QUESTION",
          content: "Check your foundational understanding of this concept:",
          question: {
            id: `chk-${concept.id}`,
            conceptId: concept.id,
            subjectId: concept.subjectId,
            topicId: concept.topicId,
            category: "RECALL",
            type: "MULTIPLE_CHOICE",
            questionText: `What is the primary definition or rule for "${concept.name}"?`,
            options: [
              concept.definitions[0] || concept.explanation.slice(0, 60),
              "A contradictory statement reversing the primary definition.",
              "An unrelated property belonging to a different topic.",
              "A non-standard variation not examinable in this course."
            ],
            correctAnswer: concept.definitions[0] || concept.explanation.slice(0, 60),
            explanation: `As stated in ${concept.sourceDocument}: ${concept.definitions[0] || concept.explanation}`,
            sourcePage: concept.sourcePage
          }
        },
        {
          stepNumber: 4,
          type: "APPLICATION_QUESTION",
          content: "Now apply this principle to solve an active question:",
          question: {
            id: `app-${concept.id}`,
            conceptId: concept.id,
            subjectId: concept.subjectId,
            topicId: concept.topicId,
            category: "APPLICATION",
            type: "MULTIPLE_CHOICE",
            questionText: `In a practical scenario testing ${concept.name}, how is this rule demonstrated?`,
            options: [
              concept.examples[0] || "By observing the direct proportional relationship established in the notes.",
              "By inverting the relationship during calculations.",
              "By setting the resultant values to zero.",
              "By ignoring the boundary constraints."
            ],
            correctAnswer: concept.examples[0] || "By observing the direct proportional relationship established in the notes.",
            explanation: `Correctly applies the principle verified in the school notes: ${concept.examples[0] || concept.name}`,
            sourcePage: concept.sourcePage
          }
        }
      ]
    };
  }
  fallbackEvaluateAnswer(question, studentAnswer) {
    const cleanStudent = studentAnswer.trim().toLowerCase();
    const cleanExpected = question.correctAnswer.trim().toLowerCase();
    const isClose = cleanStudent === cleanExpected || cleanStudent.includes(cleanExpected) || cleanExpected.includes(cleanStudent);
    if (isClose) {
      return {
        isCorrect: true,
        score: 1,
        feedback: "Correct. Your response accurately addresses the key requirements of the question."
      };
    }
    return {
      isCorrect: false,
      score: 0.3,
      feedback: `The provided response does not match the school model answer. Expected: "${question.correctAnswer}".`,
      mistakeType: "KNOWLEDGE_GAP",
      diagnosis: "Omission of key terms or conceptual relationship expected by the marking guide.",
      targetedRemediation: question.explanation
    };
  }
  fallbackGenerateTeaching(concept) {
    const formulasText = concept.formulas?.length ? concept.formulas.map((f) => `- ${f}`).join("\n") : "";
    const defsText = concept.definitions?.length ? concept.definitions.map((d) => `- ${d}`).join("\n") : "";
    return {
      title: `Understanding ${concept.name}`,
      explanation: `${concept.explanation}

This academic principle establishes the foundational relationships and boundary conditions required for mastery in ${concept.subjectName || concept.subjectId}.`,
      importantRules: [
        ...concept.formulas || [],
        ...concept.definitions || [],
        "Always check boundary conditions and units before calculating."
      ].slice(0, 3),
      simpleExamples: concept.examples?.length ? concept.examples.slice(0, 2) : [
        `Standard Application: Applying the core equation for ${concept.name} directly yields the expected baseline value.`,
        `Special Case: When boundary conditions approach zero, verify that reciprocal terms do not diverge.`
      ],
      commonMisconceptions: [
        {
          mistake: `Applying ${concept.name} without verifying initial conditions or base terms.`,
          clarification: `The principle only holds when underlying conditions and common bases match precisely.`
        }
      ],
      sourceNoteReference: {
        documentName: concept.sourceDocument || "School Syllabus Notes",
        page: concept.sourcePage || 1
      }
    };
  }
  fallbackGenerateQuestion(concept, category, difficulty) {
    return generateSubjectAwareFallbackQuestion(concept, category, difficulty);
  }
  fallbackGenerateRemediation(concept, question, studentAnswer, diagnosisType) {
    return {
      title: `Remediation for ${concept.name}: Overcoming ${diagnosisType.replace("_", " ")}`,
      mentalModelCorrection: `Your choice "${studentAnswer}" reflects a common slip where rules are conflated. When working with ${concept.name}, remember that operations apply strictly to specific parts of the expression.`,
      contrastingExample: `\u274C Common Pitfall: Conflating different operations.
\u2705 Verified Rule: ${question.correctAnswer}`,
      actionableStep: `Checklist Step: Before writing your final answer, verify that every term matches the canonical rule: "${question.correctAnswer}".`
    };
  }
  /**
   * AI Document Classification & Subject Grouping Engine
   */
  async classifyDocuments(docs) {
    if (this.isRateLimited() || !this.getClient()) {
      return this.fallbackClassifyDocuments(docs);
    }
    const prompt = `You are an expert academic taxonomy classifier.
Analyze the following document excerpts uploaded by a student.
Determine which canonical academic subject each document belongs to.

Rules:
1. Standardize clean, professional subject names (e.g. "Mathematics", "Chemistry", "Biology", "Physics", "Further Mathematics", "Economics", "English Language", "Computer Science", "Geography", "History", "Agricultural Science").
2. DO NOT use raw file names like "notes_final.pdf" or "doc1.pdf" as subject names.
3. If multiple files belong to the same academic subject (e.g. "Physics Part 1.pdf" and "Physics Part 2.pdf"), classify BOTH into the EXACT SAME subject name "Physics".
4. Infer subject from actual instructional content, formulas, terminology, and definitions, not just the file name.

Input Documents:
${JSON.stringify(docs.map((d) => ({ id: d.id, filename: d.filename, textExcerpt: d.excerpt.slice(0, 2e3) })), null, 2)}

Return strictly JSON matching this structure:
{
  "classifications": [
    {
      "docId": "string",
      "subjectName": "string",
      "reasoning": "string"
    }
  ]
}
`;
    try {
      const res = await this.generateWithModelFallback({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json", temperature: 0.1 }
      });
      const parsed = safeParseJson(res.text);
      if (parsed && Array.isArray(parsed.classifications) && parsed.classifications.length > 0) {
        return parsed.classifications.map((c) => ({
          docId: c.docId,
          filename: docs.find((d) => d.id === c.docId)?.filename || "Document",
          subjectName: this.cleanSubjectName(c.subjectName),
          reasoning: c.reasoning || "Classified based on instructional material"
        }));
      }
    } catch (err) {
      console.warn("AI document classification failed, using pattern matching fallback:", err);
    }
    return this.fallbackClassifyDocuments(docs);
  }
  fallbackClassifyDocuments(docs) {
    return docs.map((doc) => {
      const fn = doc.filename.toLowerCase();
      const text = doc.excerpt.toLowerCase();
      let subject = "General Studies";
      if (fn.includes("math") || fn.includes("calc") || fn.includes("algebra") || text.includes("theorem") || text.includes("equation")) {
        if (fn.includes("further") || text.includes("complex number") || text.includes("matrix")) {
          subject = "Further Mathematics";
        } else {
          subject = "Mathematics";
        }
      } else if (fn.includes("physic") || text.includes("velocity") || text.includes("newton") || text.includes("kinematics")) {
        subject = "Physics";
      } else if (fn.includes("chem") || text.includes("stoichiometry") || text.includes("element") || text.includes("reaction") || text.includes("mole")) {
        subject = "Chemistry";
      } else if (fn.includes("bio") || text.includes("cell") || text.includes("genetics") || text.includes("organism") || text.includes("membrane")) {
        subject = "Biology";
      } else if (fn.includes("econ") || text.includes("market") || text.includes("demand") || text.includes("supply")) {
        subject = "Economics";
      } else if (fn.includes("eng") || text.includes("grammar") || text.includes("prose")) {
        subject = "English Language";
      }
      return {
        docId: doc.id,
        filename: doc.filename,
        subjectName: subject,
        reasoning: "Classified using structural pattern heuristics"
      };
    });
  }
  cleanSubjectName(name) {
    if (!name || typeof name !== "string") return "General Studies";
    let cleaned = name.trim();
    cleaned = cleaned.replace(/^Subject:\s*/i, "");
    cleaned = cleaned.replace(/\s+Notes$/i, "");
    cleaned = cleaned.replace(/\s+Syllabus$/i, "");
    return cleaned.split(" ").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }
  /**
   * Generates an alternative explanation for a concept using a different angle/analogy.
   */
  async generateAlternativeExplanation(concept, sourceNotesText) {
    const client = this.getClient();
    if (!client) {
      return `### Alternative Explanation: ${concept.name}

Let's break this down step-by-step from a simpler perspective:

1. **Core Idea**: ${concept.explanation}
2. **Key Rule**: ${concept.formulas?.[0] || concept.definitions?.[0] || "Observe the primary relationship."}
3. **Think of it like this**: Rather than memorizing raw symbols, imagine combining identical building blocks step-by-step.`;
    }
    try {
      const prompt = `You are an expert, empathetic academic tutor.
The student asked for an ALTERNATIVE EXPLANATION because the previous one wasn't completely clear.

Concept: ${concept.name}
Subject: ${concept.subjectName || concept.subjectId}
Definitions: ${concept.definitions?.join("; ") || "None"}
Formulas: ${concept.formulas?.join("; ") || "None"}
Source Notes Excerpt:
"""
${(sourceNotesText || concept.explanation || "").slice(0, 3e3)}
"""

CRITICAL MATHEMATICAL NOTATION MANDATE:
ALL mathematical notation MUST BE WRITTEN IN VALID LaTeX DELIMITERS ('$ ... $' or '$$ ... $$').

Instructions:
1. Explain the concept from a FRESH, DIFFERENT PERSPECTIVE or simpler intuitive analogy.
2. Use clear bullet points, step-by-step reasoning, or a visual mental model.
3. Keep it concise, encouraging, and directly grounded in their official notes.
4. Ground reference: Note document page ${concept.sourcePage || 1}.

Return Markdown text directly.`;
      const models = ["gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.5-flash"];
      for (const model of models) {
        try {
          const res = await client.models.generateContent({
            model,
            contents: [{ text: prompt }],
            config: { temperature: 0.3 }
          });
          if (res.text && res.text.trim().length > 20) {
            return res.text;
          }
        } catch {
          continue;
        }
      }
      return `### Alternative Perspective: ${concept.name}

${concept.explanation}`;
    } catch (err) {
      console.warn("generateAlternativeExplanation error:", err);
      return `### Alternative Perspective: ${concept.name}

${concept.explanation}`;
    }
  }
};
var aiProvider = new GeminiProvider();

// server/services/masteryService.ts
var MasteryService = class _MasteryService {
  static {
    // Configurable evidence deltas (deterministic code control)
    this.EVIDENCE_DELTAS = {
      CORRECT_RECALL: 8,
      CORRECT_APPLICATION: 12,
      CORRECT_CALCULATION: 12,
      CORRECT_DELAYED_REVIEW: 15,
      PENALTY_KNOWLEDGE_GAP: -12,
      PENALTY_MISCONCEPTION: -15,
      PENALTY_CARELESS: -5,
      PENALTY_CALCULATION: -8,
      DEFAULT_PENALTY: -10
    };
  }
  static {
    this.SPACED_INTERVALS = [1, 2, 4, 8, 16, 30];
  }
  /**
   * Deterministically updates concept mastery following an attempt.
   * AI never decides mastery scores; application code decides.
   */
  updateMasteryOnAttempt(conceptId, isCorrect, category, attemptScore = 1, options) {
    const existing = storage.getMastery(conceptId) || {
      conceptId,
      subjectId: "",
      topicId: "",
      score: 0,
      status: "UNLEARNED",
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      consecutiveCorrect: 0,
      totalAttempts: 0,
      totalMistakes: 0,
      successfulEvidencesCount: 0,
      questionTypesEncountered: [],
      delayedReviewPassed: false
    };
    const concept = storage.getConcept(conceptId);
    if (concept) {
      existing.subjectId = concept.subjectId;
      existing.topicId = concept.topicId;
    }
    const wasDue = !existing.nextReviewDue || new Date(existing.nextReviewDue).getTime() <= Date.now();
    const hoursSinceLast = existing.lastPracticed ? (Date.now() - new Date(existing.lastPracticed).getTime()) / 36e5 : 0;
    const autoDelayed = existing.totalAttempts > 0 && wasDue && hoursSinceLast >= 20;
    const isDelayed = options?.isDelayedReview ?? autoDelayed;
    existing.totalAttempts += 1;
    existing.lastPracticed = (/* @__PURE__ */ new Date()).toISOString();
    existing.successfulEvidencesCount = existing.successfulEvidencesCount || 0;
    existing.questionTypesEncountered = existing.questionTypesEncountered || [];
    if (options?.questionType && !existing.questionTypesEncountered.includes(options.questionType)) {
      existing.questionTypesEncountered.push(options.questionType);
    }
    if (!existing.questionTypesEncountered.includes(category)) {
      existing.questionTypesEncountered.push(category);
    }
    if (isCorrect) {
      existing.consecutiveCorrect += 1;
      existing.repetitions += 1;
      existing.successfulEvidencesCount += 1;
      let delta = _MasteryService.EVIDENCE_DELTAS.CORRECT_APPLICATION;
      if (isDelayed) {
        delta = _MasteryService.EVIDENCE_DELTAS.CORRECT_DELAYED_REVIEW;
        existing.delayedReviewPassed = true;
        existing.lastReviewDate = (/* @__PURE__ */ new Date()).toISOString();
      } else if (category === "RECALL" || category === "RECOGNITION") {
        delta = _MasteryService.EVIDENCE_DELTAS.CORRECT_RECALL;
      } else if (category === "CALCULATION") {
        delta = _MasteryService.EVIDENCE_DELTAS.CORRECT_CALCULATION;
      }
      const scoreGain = Math.round(delta * attemptScore);
      existing.score = Math.min(100, Math.max(0, existing.score + scoreGain));
      if (wasDue) {
        const currentIdx = _MasteryService.SPACED_INTERVALS.indexOf(existing.intervalDays);
        if (currentIdx !== -1 && currentIdx < _MasteryService.SPACED_INTERVALS.length - 1) {
          existing.intervalDays = _MasteryService.SPACED_INTERVALS[currentIdx + 1];
        } else if (currentIdx === -1) {
          existing.intervalDays = _MasteryService.SPACED_INTERVALS[0];
        }
        const nextDate = /* @__PURE__ */ new Date();
        nextDate.setDate(nextDate.getDate() + existing.intervalDays);
        existing.nextReviewDue = nextDate.toISOString();
      }
    } else {
      existing.totalMistakes += 1;
      existing.consecutiveCorrect = 0;
      let penalty = _MasteryService.EVIDENCE_DELTAS.DEFAULT_PENALTY;
      if (options?.failureType === "KNOWLEDGE_GAP") {
        penalty = _MasteryService.EVIDENCE_DELTAS.PENALTY_KNOWLEDGE_GAP;
      } else if (options?.failureType === "MISCONCEPTION") {
        penalty = _MasteryService.EVIDENCE_DELTAS.PENALTY_MISCONCEPTION;
      } else if (options?.failureType === "CARELESS_ERROR" || options?.failureType === "MISREAD") {
        penalty = _MasteryService.EVIDENCE_DELTAS.PENALTY_CARELESS;
      } else if (options?.failureType === "CALCULATION_ERROR") {
        penalty = _MasteryService.EVIDENCE_DELTAS.PENALTY_CALCULATION;
      }
      existing.score = Math.max(5, existing.score + penalty);
      existing.intervalDays = 1;
      const nextDate = /* @__PURE__ */ new Date();
      nextDate.setDate(nextDate.getDate() + 1);
      existing.nextReviewDue = nextDate.toISOString();
    }
    const distinctTypesCount = existing.questionTypesEncountered.length;
    const hasEnoughEvidence = (existing.successfulEvidencesCount || 0) >= 3;
    const hasMultiTypes = distinctTypesCount >= 2;
    const hasDelayedOrSustained = Boolean(existing.delayedReviewPassed);
    const threshold = storage.getSettings().masteryThreshold || 80;
    if (existing.score >= threshold && hasEnoughEvidence && hasMultiTypes && hasDelayedOrSustained) {
      existing.status = "MASTERED";
    } else if (existing.score >= 60) {
      existing.status = "DEVELOPING";
    } else if (existing.score >= 20 || existing.totalAttempts > 0) {
      existing.status = "LEARNING";
    } else {
      existing.status = "UNLEARNED";
    }
    storage.updateMastery(existing);
    return existing;
  }
  /**
   * Aggregate curriculum progress metrics
   */
  getCurriculumMetrics(subjectId) {
    const concepts = storage.getConcepts(void 0, subjectId);
    const allMastery = storage.getAllMastery();
    const totalConcepts = concepts.length;
    if (totalConcepts === 0) {
      return {
        totalConcepts: 0,
        coveredConcepts: 0,
        masteredConcepts: 0,
        developingConcepts: 0,
        learningConcepts: 0,
        unlearnedConcepts: 0,
        coveragePercentage: 0,
        masteryPercentage: 0,
        averageMasteryScore: 0,
        overdueReviewsCount: 0
      };
    }
    let covered = 0;
    let mastered = 0;
    let developing = 0;
    let learning = 0;
    let unlearned = 0;
    let totalScore = 0;
    let overdueCount = 0;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    for (const c of concepts) {
      const m = allMastery[c.id];
      if (!m || m.status === "UNLEARNED" || m.totalAttempts === 0) {
        unlearned++;
      } else {
        covered++;
        totalScore += m.score;
        if (m.status === "MASTERED") mastered++;
        else if (m.status === "DEVELOPING") developing++;
        else if (m.status === "LEARNING") learning++;
        if (m.nextReviewDue && m.nextReviewDue <= now) {
          overdueCount++;
        }
      }
    }
    return {
      totalConcepts,
      coveredConcepts: covered,
      masteredConcepts: mastered,
      developingConcepts: developing,
      learningConcepts: learning,
      unlearnedConcepts: unlearned,
      coveragePercentage: Math.round(covered / totalConcepts * 100),
      masteryPercentage: Math.round(mastered / totalConcepts * 100),
      averageMasteryScore: covered > 0 ? Math.round(totalScore / covered) : 0,
      overdueReviewsCount: overdueCount
    };
  }
  /**
   * Retrieves all concepts whose spaced review interval is due.
   */
  getDueReviews(subjectId) {
    const concepts = storage.getConcepts(void 0, subjectId);
    const allMastery = storage.getAllMastery();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return concepts.filter((c) => {
      const m = allMastery[c.id];
      return m && m.totalAttempts > 0 && m.nextReviewDue && m.nextReviewDue <= now;
    }).map((c) => ({
      concept: c,
      mastery: allMastery[c.id]
    })).sort((a, b) => (a.mastery.score || 0) - (b.mastery.score || 0));
  }
};
var masteryService = new MasteryService();

// server/services/mistakeService.ts
var MistakeService = class {
  async recordMistake(question, concept, studentAnswer, providedMistakeType, providedDiagnosis, providedRemediation) {
    const open = storage.getMistakes(false).find((m) => m.questionId === question.id);
    if (open) {
      open.studentAnswer = studentAnswer;
      open.timestamp = (/* @__PURE__ */ new Date()).toISOString();
      storage.persist();
      return open;
    }
    let mistakeType = providedMistakeType || "MISCONCEPTION";
    let diagnosis = providedDiagnosis;
    let remediation = providedRemediation;
    if (!diagnosis || !remediation) {
      if (question.type === "NUMERICAL") {
        const studentNum = parseFloat(studentAnswer);
        const expectedNum = parseFloat(question.correctAnswer);
        if (!isNaN(studentNum) && !isNaN(expectedNum)) {
          mistakeType = "CALCULATION_ERROR";
          diagnosis = `Calculation yielded ${studentAnswer} instead of the expected ${question.correctAnswer} ${question.units || ""}.`;
          remediation = `Double-check intermediate arithmetic steps and unit conversion for ${concept.name}.`;
        }
      }
      if (!diagnosis) {
        const aiDiag = await aiProvider.diagnoseMistake(question, studentAnswer, concept);
        mistakeType = providedMistakeType || aiDiag.mistakeType;
        diagnosis = aiDiag.diagnosis;
        remediation = aiDiag.remediation;
      }
    }
    const record = {
      id: `mistake-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      questionId: question.id,
      conceptId: concept.id,
      topicId: concept.topicId,
      subjectId: concept.subjectId,
      conceptName: concept.name,
      questionText: question.questionText,
      studentAnswer,
      correctAnswer: question.correctAnswer,
      mistakeType,
      diagnosis: diagnosis || "Response failed to satisfy the curriculum standard.",
      targetedRemediation: remediation || question.explanation,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      resolved: false,
      resolutionAttempts: 0,
      nextReviewDate: (/* @__PURE__ */ new Date()).toISOString()
    };
    storage.addMistake(record);
    return record;
  }
  getUnresolvedMistakes(subjectId) {
    const list = storage.getMistakes(false);
    if (subjectId) {
      return list.filter((m) => m.subjectId === subjectId);
    }
    return list;
  }
  getMistakeStats(subjectId) {
    const all = storage.getMistakes();
    const filtered = subjectId ? all.filter((m) => m.subjectId === subjectId) : all;
    const unresolved = filtered.filter((m) => !m.resolved);
    const byType = {};
    for (const m of unresolved) {
      byType[m.mistakeType] = (byType[m.mistakeType] || 0) + 1;
    }
    return {
      totalRecorded: filtered.length,
      unresolvedCount: unresolved.length,
      resolvedCount: filtered.length - unresolved.length,
      byType
    };
  }
};
var mistakeService = new MistakeService();

// server/services/plannerService.ts
var PlannerService = class {
  /**
   * Algorithmically generates a balanced daily study plan based on:
   * 1. Overdue spaced repetition items (Retention)
   * 2. Active mistakes needing remediation (Mistake Bank)
   * 3. Unlearned concepts needing curriculum coverage (Coverage)
   * 4. Weak developing concepts needing practice (Mastery)
   */
  /** A cached plan is rebuilt when the daily target changed or its "learn" task was already studied. */
  isStale(plan, targetMinutes) {
    if (plan.targetMinutes !== targetMinutes) return true;
    const mastery = storage.getAllMastery();
    return plan.items.some(
      (i) => !i.completed && i.type === "NEW_LEARN" && i.conceptId && (mastery[i.conceptId]?.totalAttempts || 0) > 0
    );
  }
  generateDailyPlan(targetMinutes = 90, dateStr) {
    const today = dateStr || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const existing = storage.getDailyPlan(today);
    if (existing && existing.items.length > 0 && !this.isStale(existing, targetMinutes)) {
      return existing;
    }
    const carried = (existing?.items || []).filter((i) => i.completed);
    const items = [];
    let allocatedMinutes = 0;
    const allConcepts = storage.getConcepts();
    const allMastery = storage.getAllMastery();
    const subjects = storage.getSubjects();
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
    const dueReviews = masteryService.getDueReviews();
    const unresolvedMistakes = storage.getMistakes(false);
    if (dueReviews.length > 0 && allocatedMinutes < targetMinutes) {
      const reviewConcept = dueReviews[0].concept;
      const minutes = Math.min(25, Math.max(15, Math.round(targetMinutes * 0.25)));
      items.push({
        id: `plan-rev-${Date.now()}-1`,
        type: "SPACED_REVIEW",
        subjectId: reviewConcept.subjectId,
        subjectName: subjectMap.get(reviewConcept.subjectId) || "Subject",
        topicId: reviewConcept.topicId,
        conceptId: reviewConcept.id,
        title: `Spaced Retrieval: ${reviewConcept.name}`,
        description: `Scheduled review due according to your forgetting curve. Reinforce durable retention.`,
        estimatedMinutes: minutes,
        completed: false,
        priority: "HIGH",
        reason: "Interval due to prevent memory decay"
      });
      allocatedMinutes += minutes;
    }
    if (unresolvedMistakes.length > 0 && allocatedMinutes < targetMinutes) {
      const mistake = unresolvedMistakes[0];
      const minutes = Math.min(20, Math.max(15, Math.round(targetMinutes * 0.2)));
      items.push({
        id: `plan-mistake-${Date.now()}-2`,
        type: "MISTAKE_REMEDIATION",
        subjectId: mistake.subjectId,
        subjectName: subjectMap.get(mistake.subjectId) || "Subject",
        topicId: mistake.topicId,
        conceptId: mistake.conceptId,
        title: `Mistake Remediation: ${mistake.conceptName}`,
        description: `Targeted practice to resolve ${mistake.mistakeType}: "${mistake.diagnosis.slice(0, 80)}..."`,
        estimatedMinutes: minutes,
        completed: false,
        priority: "HIGH",
        reason: "Unresolved mistake from previous practice session"
      });
      allocatedMinutes += minutes;
    }
    const unlearnedConcepts = allConcepts.filter((c) => {
      const m = allMastery[c.id];
      return !m || m.status === "UNLEARNED" || m.totalAttempts === 0;
    });
    if (unlearnedConcepts.length > 0 && allocatedMinutes < targetMinutes) {
      const nextConcept = unlearnedConcepts[0];
      const minutes = Math.min(30, targetMinutes - allocatedMinutes);
      items.push({
        id: `plan-new-${Date.now()}-3`,
        type: "NEW_LEARN",
        subjectId: nextConcept.subjectId,
        subjectName: subjectMap.get(nextConcept.subjectId) || "Subject",
        topicId: nextConcept.topicId,
        conceptId: nextConcept.id,
        title: `New Concept: ${nextConcept.name}`,
        description: `Interactive lesson grounded in ${nextConcept.sourceDocument}. Build initial comprehension.`,
        estimatedMinutes: minutes,
        completed: false,
        priority: "MEDIUM",
        reason: "Untouched curriculum material required for term examination"
      });
      allocatedMinutes += minutes;
    }
    if (allocatedMinutes < targetMinutes) {
      const remainingMinutes = targetMinutes - allocatedMinutes;
      const practicedConcepts = allConcepts.filter((c) => (allMastery[c.id]?.totalAttempts || 0) > 0);
      const sampleSubject = practicedConcepts[0]?.subjectId || subjects[0]?.id || "sub-physics";
      items.push({
        id: `plan-test-${Date.now()}-4`,
        type: "MIXED_RETRIEVAL",
        subjectId: sampleSubject,
        subjectName: subjectMap.get(sampleSubject) || "Mixed Subjects",
        title: "Mixed Topic Check & Active Application",
        description: "Cumulative test across covered concepts to verify independent problem-solving ability.",
        estimatedMinutes: remainingMinutes,
        completed: false,
        priority: "MEDIUM",
        reason: "Simulate examination conditions and interleaving"
      });
      allocatedMinutes += remainingMinutes;
    }
    const carriedKeys = new Set(carried.map((i) => `${i.type}:${i.conceptId || ""}`));
    const fresh = items.filter((i) => i.type === "MIXED_RETRIEVAL" || !carriedKeys.has(`${i.type}:${i.conceptId || ""}`));
    const plan = {
      date: today,
      targetMinutes,
      items: [...carried, ...fresh],
      summary: `Targeting ${targetMinutes} min: balanced across spaced review, mistake correction, and new curriculum coverage.`,
      completedMinutes: carried.reduce((sum, i) => sum + i.estimatedMinutes, 0)
    };
    storage.saveDailyPlan(plan);
    return plan;
  }
};
var plannerService = new PlannerService();

// server/ai/groqProvider.ts
var GroqProvider = class {
  constructor() {
    this.name = "Groq";
    this.apiKey = process.env.GROQ_API_KEY;
  }
  async classifyDocuments(docs) {
    return docs.map((doc) => ({
      docId: doc.id,
      filename: doc.filename,
      subjectName: "General Studies",
      reasoning: "Fallback classification"
    }));
  }
  async callGroqChat(messages, jsonMode = false) {
    if (!this.apiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.2,
        response_format: jsonMode ? { type: "json_object" } : void 0
      })
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Groq API error ${response.status}: ${text}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }
  async extractCurriculum(subjectName, notesText) {
    const prompt = `You are a school curriculum extraction specialist.
CRITICAL MATHEMATICAL NOTATION MANDATE:
ALL mathematical notation, formulas, equations, variables, symbols, fractions, powers, or chemical expressions MUST BE WRITTEN IN VALID LaTeX DELIMITERS ($ ... $ or $$ ... $$).

Extract a hierarchical academic curriculum from the student's uploaded notes for: "${subjectName}".
Notes snippet:
"""
${(notesText || "").slice(0, 2e4)}
"""
Return JSON matching:
{
  "topics": [
    {
      "title": "Topic Title",
      "description": "...",
      "subtopics": [{ "title": "Subtopic Title" }],
      "concepts": [
        {
          "name": "Concept Name",
          "subtopicTitle": "Subtopic Title",
          "explanation": "Clear explanation",
          "definitions": ["..."],
          "formulas": ["..."],
          "keyFacts": ["..."],
          "examples": ["..."],
          "sourcePage": 1
        }
      ]
    }
  ]
}`;
    const text = await this.callGroqChat([{ role: "user", content: prompt }], true);
    return JSON.parse(text);
  }
  async generateTeaching(concept, sourceNotesText) {
    const prompt = `You are an expert academic tutor.
Teach this concept grounded directly in the student's school notes:
Subject: ${concept.subjectName || concept.subjectId}
Concept: ${concept.name}
Definitions: ${concept.definitions?.join("; ")}
Formulas: ${concept.formulas?.join("; ")}
Key Facts: ${concept.keyFacts?.join("; ")}
Notes excerpt: ${sourceNotesText?.slice(0, 3e3) || concept.explanation}

Provide a clear, engaging explanation (NOT just copying text), 2 simple illustrative examples, essential conditions/rules, and common misconceptions.
Return JSON:
{
  "title": "How and Why ${concept.name} Works",
  "explanation": "Detailed clear markdown explanation...",
  "importantRules": ["Rule 1", "Rule 2"],
  "simpleExamples": ["Example 1 with step by step", "Example 2"],
  "commonMisconceptions": [
    { "mistake": "Common error students make", "clarification": "Why that is wrong and how to think correctly" }
  ],
  "sourceNoteReference": {
    "documentName": "${concept.sourceDocument || "School Notes"}",
    "page": ${concept.sourcePage || 1}
  }
}`;
    const text = await this.callGroqChat([{ role: "user", content: prompt }], true);
    return JSON.parse(text);
  }
  async generateQuestion(concept, category, difficulty, previousMistakes, sourceNotesText) {
    const prompt = `Generate a ${difficulty} ${category} question grounded in the school curriculum for:
Concept: ${concept.name}
Formulas/Rules: ${concept.formulas?.join("; ")}
Definitions: ${concept.definitions?.join("; ")}
Notes Context: ${sourceNotesText?.slice(0, 1500) || concept.explanation}
Previous Mistakes to target: ${previousMistakes?.join("; ") || "None"}

Return JSON:
{
  "category": "${category}",
  "type": "MULTIPLE_CHOICE",
  "questionText": "...",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Detailed rationale referencing the notes",
  "distractorDiagnoses": {
    "Option B": "MISCONCEPTION",
    "Option C": "CALCULATION_ERROR",
    "Option D": "KNOWLEDGE_GAP"
  },
  "sourcePage": ${concept.sourcePage || 1}
}`;
    const text = await this.callGroqChat([{ role: "user", content: prompt }], true);
    const parsed = JSON.parse(text);
    return shuffleQuestionOptions(parsed);
  }
  async generateLesson(concept, sourceNotesText) {
    const teaching = await this.generateTeaching(concept, sourceNotesText);
    const q1 = await this.generateQuestion(concept, "APPLICATION", "MEDIUM", void 0, sourceNotesText);
    return {
      steps: [
        {
          stepNumber: 1,
          type: "EXPLANATION",
          content: teaching.explanation
        },
        {
          stepNumber: 2,
          type: "APPLICATION_QUESTION",
          content: "Application Challenge",
          question: {
            id: `q-groq-${Date.now()}`,
            conceptId: concept.id,
            subjectId: concept.subjectId,
            topicId: concept.topicId,
            category: q1.category,
            type: q1.type,
            questionText: q1.questionText,
            options: q1.options,
            correctAnswer: q1.correctAnswer,
            explanation: q1.explanation,
            distractorDiagnoses: q1.distractorDiagnoses,
            sourcePage: q1.sourcePage
          }
        }
      ]
    };
  }
  async evaluateOpenAnswer(question, studentAnswer, concept, sourceNotesText) {
    const prompt = `Evaluate student's answer against the school notes:
Question: ${question.questionText}
Model Answer: ${question.correctAnswer}
Student Answer: ${studentAnswer}
Concept: ${concept.name}
Notes context: ${sourceNotesText || concept.explanation}

Return JSON:
{
  "isCorrect": boolean,
  "verdict": "CORRECT" | "PARTIALLY_CORRECT" | "INCORRECT" | "AMBIGUOUS",
  "score": number, // 0.0 to 1.0
  "feedback": "Constructive explanation",
  "mistakeType": "KNOWLEDGE_GAP" | "MISCONCEPTION" | "RECALL_FAILURE" | "CALCULATION_ERROR" | "MISREAD" | "CARELESS_ERROR" | "APPLICATION_FAILURE",
  "diagnosis": "Root cause",
  "targetedRemediation": "Rule to follow"
}`;
    const text = await this.callGroqChat([{ role: "user", content: prompt }], true);
    return JSON.parse(text);
  }
  async diagnoseMistake(question, studentAnswer, concept) {
    const prompt = `Diagnose student error:
Question: ${question.questionText}
Expected: ${question.correctAnswer}
Student Answer: ${studentAnswer}
Concept: ${concept.name}

Return JSON:
{
  "mistakeType": "MISCONCEPTION" | "CALCULATION_ERROR" | "KNOWLEDGE_GAP" | "RECALL_FAILURE" | "CARELESS_ERROR",
  "diagnosis": "1-sentence reason",
  "remediation": "1-sentence remediation rule"
}`;
    const text = await this.callGroqChat([{ role: "user", content: prompt }], true);
    return JSON.parse(text);
  }
  async generateRemediation(concept, question, studentAnswer, diagnosisType) {
    const prompt = `Generate targeted remediation for a student with diagnosis: ${diagnosisType}
Concept: ${concept.name}
Question: ${question.questionText}
Student Answer: ${studentAnswer}
Correct: ${question.correctAnswer}

Return JSON:
{
  "title": "Targeted Remediation: Clarifying ${concept.name}",
  "mentalModelCorrection": "...",
  "contrastingExample": "...",
  "actionableStep": "..."
}`;
    const text = await this.callGroqChat([{ role: "user", content: prompt }], true);
    return JSON.parse(text);
  }
};

// server/ai/aiService.ts
var AIService = class {
  constructor() {
    this.name = "Orchestrated AIService (Gemini -> Groq -> Deterministic)";
    this.gemini = new GeminiProvider();
    this.groq = new GroqProvider();
  }
  hasGroq() {
    return Boolean(process.env.GROQ_API_KEY);
  }
  async classifyDocuments(docs) {
    return this.gemini.classifyDocuments(docs);
  }
  async extractCurriculum(subjectName, notesText, pdfBuffer) {
    try {
      return await this.gemini.extractCurriculum(subjectName, notesText, pdfBuffer);
    } catch (geminiErr) {
      if (this.hasGroq()) {
        try {
          return await this.groq.extractCurriculum(subjectName, notesText);
        } catch (groqErr) {
          console.warn("Groq extractCurriculum failed, using fallback:", groqErr);
        }
      }
      return await this.gemini.extractCurriculum(subjectName, notesText);
    }
  }
  async generateTeaching(concept, sourceNotesText, studentMastery) {
    try {
      return await this.gemini.generateTeaching(concept, sourceNotesText, studentMastery);
    } catch (geminiErr) {
      if (this.hasGroq()) {
        try {
          return await this.groq.generateTeaching(concept, sourceNotesText);
        } catch {
        }
      }
      throw geminiErr;
    }
  }
  async generateQuestion(concept, category, difficulty, previousMistakes, sourceNotesText) {
    try {
      return await this.gemini.generateQuestion(concept, category, difficulty, previousMistakes, sourceNotesText);
    } catch (geminiErr) {
      if (this.hasGroq()) {
        try {
          return await this.groq.generateQuestion(concept, category, difficulty, previousMistakes, sourceNotesText);
        } catch {
        }
      }
      throw geminiErr;
    }
  }
  async generateLesson(concept, sourceNotesText) {
    try {
      return await this.gemini.generateLesson(concept, sourceNotesText);
    } catch (geminiErr) {
      if (this.hasGroq()) {
        try {
          return await this.groq.generateLesson(concept, sourceNotesText);
        } catch {
        }
      }
      throw geminiErr;
    }
  }
  async evaluateOpenAnswer(question, studentAnswer, concept, sourceNotesText) {
    try {
      return await this.gemini.evaluateOpenAnswer(question, studentAnswer, concept, sourceNotesText);
    } catch (geminiErr) {
      if (this.hasGroq()) {
        try {
          return await this.groq.evaluateOpenAnswer(question, studentAnswer, concept, sourceNotesText);
        } catch {
        }
      }
      throw geminiErr;
    }
  }
  async diagnoseMistake(question, studentAnswer, concept) {
    try {
      return await this.gemini.diagnoseMistake(question, studentAnswer, concept);
    } catch (geminiErr) {
      if (this.hasGroq()) {
        try {
          return await this.groq.diagnoseMistake(question, studentAnswer, concept);
        } catch {
        }
      }
      throw geminiErr;
    }
  }
  async generateRemediation(concept, question, studentAnswer, diagnosisType) {
    try {
      return await this.gemini.generateRemediation(concept, question, studentAnswer, diagnosisType);
    } catch (geminiErr) {
      if (this.hasGroq()) {
        try {
          return await this.groq.generateRemediation(concept, question, studentAnswer, diagnosisType);
        } catch {
        }
      }
      throw geminiErr;
    }
  }
};
var aiService = new AIService();

// server/services/lessonEngine.ts
var masteryService2 = new MasteryService();
var mistakeService2 = new MistakeService();
var FlexibleLessonEngine = class {
  constructor() {
    this.sessions = /* @__PURE__ */ new Map();
    this.activityPoolCache = /* @__PURE__ */ new Map();
  }
  /**
   * Starts an evidence-driven adaptive lesson session.
   * AI understands the source notes and teaches the concept.
   * Deterministic code coordinates session state and evidence accumulation.
   */
  async startSession(conceptId, sessionId, options) {
    const concept = storage.getConcept(conceptId);
    if (!concept) {
      throw new Error(`Concept with ID ${conceptId} not found.`);
    }
    const topic = storage.getTopics().find((t) => t.id === concept.topicId);
    const subject = storage.getSubject(concept.subjectId);
    const mastery = storage.getMastery(conceptId);
    const sId = sessionId || `session-${conceptId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const pool = await this.getOrCreateActivityPool(concept);
    let initialActivity = pool.explanation;
    if (!options?.forceNewStudent && mastery && mastery.score >= 60 && mastery.totalAttempts > 0) {
      initialActivity = pool.recallQuestion || pool.primaryApplication;
    }
    const session = {
      sessionId: sId,
      conceptId: concept.id,
      conceptName: concept.name,
      subtopicTitle: concept.subtopicTitle,
      topicTitle: topic?.title || "Course Topic",
      subjectName: subject?.name || "Academic Subject",
      sourceDocName: concept.sourceDocument || "School Syllabus",
      sourcePage: concept.sourcePage,
      currentActivity: initialActivity,
      activityIndex: 0,
      history: [],
      evidence: {
        explanationDelivered: false,
        recallDemonstrated: false,
        applicationDemonstrated: false,
        consecutiveCorrect: 0,
        totalAttempts: 0,
        totalMistakes: 0,
        detectedMisconceptions: []
      },
      isComplete: false,
      masteryScore: mastery?.score || 0
    };
    this.sessions.set(sId, session);
    return session;
  }
  getSession(sessionId) {
    return this.sessions.get(sessionId) || storage.getSession(sessionId);
  }
  /**
   * Processes student input for the current activity and adaptively
   * determines the next step based on real evidence.
   */
  async processResponse(sessionId, studentAnswer) {
    const session = this.sessions.get(sessionId) || storage.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found.`);
    }
    const currentAct = session.currentActivity;
    const concept = storage.getConcept(session.conceptId);
    const pool = await this.getOrCreateActivityPool(concept);
    if (!currentAct.question) {
      if (currentAct.type === "EXPLAIN") {
        session.evidence.explanationDelivered = true;
      }
      session.history.push({
        activityId: currentAct.id,
        activityType: currentAct.type,
        title: currentAct.title,
        completedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (currentAct.type === "SUMMARY") {
        session.isComplete = true;
        return { session };
      }
      if (currentAct.type === "REMEDIATION") {
        const nextAct2 = pool.misconceptionCheck || pool.followUpApplication || pool.primaryApplication;
        session.currentActivity = nextAct2;
        session.activityIndex += 1;
        return { session };
      }
      const nextAct = pool.primaryApplication;
      session.currentActivity = nextAct;
      session.activityIndex += 1;
      return { session };
    }
    const q = currentAct.question;
    const cleanStudent = (studentAnswer || "").trim();
    let isCorrect = this.evaluateAnswer(q, cleanStudent);
    let openFeedback;
    let failureType = "CARELESS_ERROR";
    if (q.type === "OPEN_EXPLANATION") {
      try {
        const evalResult = await aiService.evaluateOpenAnswer(q, cleanStudent, concept);
        isCorrect = evalResult.isCorrect;
        openFeedback = evalResult.feedback;
        if (evalResult.mistakeType) {
          failureType = evalResult.mistakeType;
        }
      } catch {
        isCorrect = this.evaluateAnswer(q, cleanStudent);
      }
    }
    session.evidence.totalAttempts += 1;
    let feedbackText = "";
    let remediationSummary = "";
    if (isCorrect) {
      session.evidence.consecutiveCorrect += 1;
      if (q.category === "RECALL" || currentAct.type === "RECALL") {
        session.evidence.recallDemonstrated = true;
      }
      if (q.category === "APPLICATION" || q.category === "CALCULATION" || currentAct.type === "APPLICATION") {
        session.evidence.applicationDemonstrated = true;
      }
      feedbackText = openFeedback || `Correct! ${q.explanation}`;
      const updatedMastery = masteryService2.updateMasteryOnAttempt(
        concept.id,
        true,
        q.category,
        1,
        { questionType: q.category }
      );
      session.masteryScore = updatedMastery.score;
      storage.recordAttempt({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        questionId: q.id,
        conceptId: concept.id,
        subjectId: concept.subjectId,
        studentAnswer: cleanStudent,
        isCorrect: true,
        score: 1,
        feedback: feedbackText,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      session.evidence.consecutiveCorrect = 0;
      session.evidence.totalMistakes += 1;
      failureType = this.diagnoseFailure(q, cleanStudent, currentAct);
      session.evidence.activeDiagnosis = failureType;
      if (failureType === "MISCONCEPTION") {
        session.evidence.detectedMisconceptions.push(
          currentAct.targetMisconception || "Misapplied rule or concept relation"
        );
      }
      feedbackText = openFeedback || this.generateDiagnosticFeedback(q, cleanStudent, failureType, concept);
      remediationSummary = q.explanation;
      const updatedMastery = masteryService2.updateMasteryOnAttempt(
        concept.id,
        false,
        q.category,
        0,
        { failureType, questionType: q.category }
      );
      session.masteryScore = updatedMastery.score;
      await mistakeService2.recordMistake(
        q,
        concept,
        cleanStudent,
        failureType,
        feedbackText,
        q.explanation
      );
      storage.recordAttempt({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        questionId: q.id,
        conceptId: concept.id,
        subjectId: concept.subjectId,
        studentAnswer: cleanStudent,
        isCorrect: false,
        score: 0,
        feedback: feedbackText,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    session.history.push({
      activityId: currentAct.id,
      activityType: currentAct.type,
      title: currentAct.title,
      studentAnswer: cleanStudent,
      isCorrect,
      score: isCorrect ? 1 : 0,
      feedback: feedbackText,
      diagnosisType: isCorrect ? void 0 : failureType,
      completedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const nextActivity = this.determineNextActivity(session, pool, isCorrect, failureType);
    session.currentActivity = nextActivity;
    session.activityIndex += 1;
    if (nextActivity.type === "SUMMARY") {
      session.isComplete = true;
      session.summaryMessage = this.generateSummaryMessage(session);
    }
    return {
      session,
      feedback: {
        isCorrect,
        feedbackText,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        diagnosisType: isCorrect ? void 0 : failureType,
        remediationSummary
      }
    };
  }
  /**
   * Deterministic decision logic: Selects next activity based on student evidence.
   * Satisfies the Three-Student Benchmark.
   */
  determineNextActivity(session, pool, lastCorrect, lastDiagnosis) {
    const { evidence } = session;
    if (lastCorrect) {
      if (session.currentActivity.type === "MISCONCEPTION_CHECK") {
        if (pool.guidedPractice) return pool.guidedPractice;
        return pool.followUpApplication;
      }
      if (session.currentActivity.type === "GUIDED_PRACTICE") {
        if (evidence.consecutiveCorrect >= 2) {
          return this.createSummaryActivity(session, "Remediation and Guided Practice Successfully Completed");
        }
        return pool.followUpApplication;
      }
      if (evidence.explanationDelivered && evidence.applicationDemonstrated) {
        if (evidence.totalMistakes === 0) {
          if (evidence.consecutiveCorrect >= 2 || session.history.length >= 3) {
            return this.createSummaryActivity(session, "Direct Mastery Demonstration (Fast Track)");
          }
          return pool.followUpApplication;
        }
        if (evidence.totalMistakes === 1 && evidence.consecutiveCorrect >= 1) {
          return this.createSummaryActivity(session, "Competence Verified After Remediation");
        }
        if (evidence.consecutiveCorrect >= 2 || evidence.totalMistakes >= 2 && evidence.applicationDemonstrated) {
          return this.createSummaryActivity(session, "Remediation and Practice Successfully Completed");
        }
      }
      if (!evidence.applicationDemonstrated) {
        return pool.primaryApplication;
      }
      return this.createSummaryActivity(session, "Readiness Criteria Met");
    }
    if (lastDiagnosis === "MISCONCEPTION") {
      const hasTriedMisconceptionCheck = session.history.some(
        (h) => h.activityType === "MISCONCEPTION_CHECK"
      );
      if (pool.misconceptionCheck && !hasTriedMisconceptionCheck) {
        return pool.misconceptionCheck;
      }
      const remAct2 = pool.remediationActivities["MISCONCEPTION"] || {
        id: `act-rem-misc-${Date.now()}`,
        type: "REMEDIATION",
        title: "Targeted Remediation: Clarifying Conceptual Misconception",
        instruction: "Review this essential conceptual distinction before testing your understanding.",
        content: `**Key Mental Model Correction**

${session.currentActivity.question?.explanation || "Be careful not to conflate separate mathematical or operational rules."}

*Rule*: Verify operations apply strictly to compatible bases and constraints as outlined in your school notes.`
      };
      return remAct2;
    }
    if (evidence.totalMistakes >= 2) {
      const hasTriedGuided = session.history.some((h) => h.activityType === "GUIDED_PRACTICE");
      if (pool.guidedPractice && !hasTriedGuided) {
        return pool.guidedPractice;
      }
      if (pool.workedExample) {
        return pool.workedExample;
      }
    }
    const remAct = pool.remediationActivities["CALCULATION_ERROR"] || {
      id: `act-rem-calc-${Date.now()}`,
      type: "REMEDIATION",
      title: "Targeted Remediation: Step-by-Step Procedure Review",
      instruction: "Review the step-by-step arithmetic procedure below.",
      content: `**Step-by-Step Procedure Checklist**

${session.currentActivity.question?.explanation || "Carefully observe the order of operations and boundary conditions."}

*Teacher Tip*: Check each intermediate step individually before finalizing your answer.`
    };
    return remAct;
  }
  createSummaryActivity(session, reason) {
    const totalActs = session.history.length;
    const mistakes = session.evidence.totalMistakes;
    const pathSummary = session.history.map((h, i) => `${i + 1}. ${h.activityType}`).join(" \u2192 ");
    return {
      id: `act-summary-${session.conceptId}`,
      type: "SUMMARY",
      title: "Concept Learning Completed",
      instruction: "You have satisfied the academic evidence criteria for this concept.",
      content: `### Learning Evidence Summary

**Reason**: ${reason}

\u2022 **Activities Completed**: ${totalActs}
\u2022 **Mistakes Handled**: ${mistakes}
\u2022 **Learning Path Followed**: ${pathSummary}
\u2022 **Mastery Score Recorded**: ${session.masteryScore}/100

This concept will now automatically transition into your scheduled spaced retrieval and practice planner.`
    };
  }
  generateSummaryMessage(session) {
    if (session.evidence.totalMistakes === 0) {
      return `Fast-Track Mastery: You understood the concept immediately and demonstrated flawless application.`;
    }
    if (session.evidence.totalMistakes === 1) {
      return `Targeted Mastery: You diagnosed and corrected an application slip through guided remediation.`;
    }
    return `Deep Mastery: You actively worked through conceptual misconceptions and demonstrated verified understanding.`;
  }
  evaluateAnswer(question, studentAnswer) {
    if (!studentAnswer) return false;
    const cleanStudent = studentAnswer.trim().toLowerCase();
    const cleanCorrect = question.correctAnswer.trim().toLowerCase();
    if (cleanStudent === cleanCorrect) return true;
    if (cleanStudent.startsWith("a.") || cleanStudent.startsWith("b.") || cleanStudent.startsWith("c.") || cleanStudent.startsWith("d.")) {
      const optionText = cleanStudent.slice(2).trim();
      if (optionText === cleanCorrect) return true;
    }
    if (question.type === "NUMERICAL") {
      const match = numericMatches(cleanStudent, cleanCorrect, question.tolerance);
      if (match !== null) return match;
    }
    return false;
  }
  diagnoseFailure(question, studentAnswer, activity) {
    if (question.distractorDiagnoses && question.distractorDiagnoses[studentAnswer]) {
      return question.distractorDiagnoses[studentAnswer];
    }
    if (activity.type === "MISCONCEPTION_CHECK") {
      return "MISCONCEPTION";
    }
    if (question.type === "NUMERICAL") {
      return "CALCULATION_ERROR";
    }
    const clean = studentAnswer.toLowerCase();
    if (clean.includes("add") || clean.includes("plus") || clean.includes("+")) {
      return "MISCONCEPTION";
    }
    return "APPLICATION_FAILURE";
  }
  generateDiagnosticFeedback(question, studentAnswer, diagnosis, concept) {
    if (diagnosis === "MISCONCEPTION") {
      return `Misconception detected in your response "${studentAnswer}". In ${concept.name}, this rule does not apply when boundary conditions or bases differ. Expected: "${question.correctAnswer}". Let's clarify the underlying distinction.`;
    }
    if (diagnosis === "CALCULATION_ERROR") {
      return `Your conceptual approach was on track, but a calculation error occurred. Expected: "${question.correctAnswer}". Let's review the step-by-step arithmetic.`;
    }
    if (diagnosis === "RECALL_FAILURE") {
      return `That does not match the formal rule from the notes. Expected: "${question.correctAnswer}". Let's reinforce the rule.`;
    }
    return `That response does not satisfy the school notes specification. Expected: "${question.correctAnswer}". Let's review why.`;
  }
  /**
   * Generates or retrieves a rich, curriculum-grounded activity pool for ANY concept.
   * AI understands source notes and turns them into real pedagogic teaching.
   */
  async getOrCreateActivityPool(concept) {
    if (this.activityPoolCache.has(concept.id)) {
      return this.activityPoolCache.get(concept.id);
    }
    const mastery = storage.getMastery(concept.id);
    const masteryScore = mastery?.score || 0;
    let teaching;
    try {
      teaching = await aiService.generateTeaching(concept, void 0, masteryScore);
    } catch {
      teaching = {
        title: `Understanding ${concept.name}`,
        explanation: `${concept.explanation}

This academic principle establishes the foundational relationships and boundary conditions required for mastery in ${concept.subjectName || concept.subjectId}.`,
        importantRules: [
          ...concept.formulas || [],
          ...concept.definitions || [],
          "Always check boundary conditions and units before calculating."
        ].slice(0, 3),
        simpleExamples: concept.examples?.length ? concept.examples.slice(0, 2) : [`Standard application of ${concept.name} demonstrates expected behavior under syllabus guidelines.`],
        commonMisconceptions: [
          {
            mistake: `Applying ${concept.name} without verifying initial conditions or base terms.`,
            clarification: `The principle only holds when underlying conditions and common bases match precisely.`
          }
        ],
        sourceNoteReference: {
          documentName: concept.sourceDocument || "School Syllabus Notes",
          page: concept.sourcePage || 1
        }
      };
    }
    const rulesList = teaching.importantRules.map((r) => `\u2022 **${r}**`).join("\n");
    const examplesList = teaching.simpleExamples.map((ex, i) => `**Example ${i + 1}**:
${ex}`).join("\n\n");
    const trapsList = teaching.commonMisconceptions.map((m) => `\u26A0\uFE0F **Common Mistake**: ${m.mistake}
*Correction*: ${m.clarification}`).join("\n\n");
    const explanationContent = `### 1. The Core Principle
${teaching.explanation}

---

### 2. Essential Rules & Conditions
${rulesList}

---

### 3. Step-by-Step Illustrative Examples
${examplesList}

---

### 4. Critical Exam Traps & Misconceptions to Avoid
${trapsList}`;
    const existingQuestions = storage.getQuestions(concept.id);
    let qApp1 = null;
    let qApp2 = null;
    let qRecall = null;
    if (existingQuestions.length >= 3) {
      qApp1 = existingQuestions.find((q) => q.category === "APPLICATION");
      qRecall = existingQuestions.find((q) => q.category === "RECALL");
      qApp2 = existingQuestions.find((q) => q.id !== qApp1?.id && q.id !== qRecall?.id);
    }
    if (!qApp1 || !qApp2 || !qRecall) {
      if (existingQuestions.length >= 2) {
        qApp1 = qApp1 || existingQuestions.find((q) => q.category === "APPLICATION") || existingQuestions[0];
        qApp2 = qApp2 || existingQuestions.find((q) => q.id !== qApp1?.id) || existingQuestions[1] || existingQuestions[0];
        qRecall = qRecall || existingQuestions.find((q) => q.category === "RECALL") || existingQuestions[0];
      } else if (concept.sampleQuestions && concept.sampleQuestions.length >= 2) {
        qApp1 = qApp1 || concept.sampleQuestions.find((q) => q.category === "APPLICATION") || concept.sampleQuestions[0];
        qApp2 = qApp2 || concept.sampleQuestions.find((q) => q !== qApp1) || concept.sampleQuestions[1];
        qRecall = qRecall || concept.sampleQuestions.find((q) => q.category === "RECALL") || concept.sampleQuestions[0];
      }
    }
    if (!qApp1 || !qApp2 || !qRecall) {
      try {
        const [aiQ1, aiQ2, aiRecall] = await Promise.all([
          !qApp1 ? aiService.generateQuestion(concept, "APPLICATION", "MEDIUM") : Promise.resolve(null),
          !qApp2 ? aiService.generateQuestion(concept, "APPLICATION", "HARD") : Promise.resolve(null),
          !qRecall ? aiService.generateQuestion(concept, "RECALL", "EASY") : Promise.resolve(null)
        ]);
        if (aiQ1) qApp1 = aiQ1;
        if (aiQ2) qApp2 = aiQ2;
        if (aiRecall) qRecall = aiRecall;
      } catch (err) {
        console.error("AI question generation error, will fall back:", err);
      }
    }
    const mainFormula = concept.formulas?.[0] || concept.definitions?.[0] || concept.name;
    if (!qApp1) {
      qApp1 = generateSubjectAwareFallbackQuestion(concept, "APPLICATION", "MEDIUM");
    }
    if (!qApp2) {
      qApp2 = generateSubjectAwareFallbackQuestion(concept, "APPLICATION", "HARD");
    }
    if (!qRecall) {
      qRecall = generateSubjectAwareFallbackQuestion(concept, "RECALL", "EASY");
    }
    const question1 = shuffleQuestionOptions({
      id: `q-app1-${concept.id}`,
      conceptId: concept.id,
      subjectId: concept.subjectId,
      topicId: concept.topicId,
      category: qApp1.category || "APPLICATION",
      type: qApp1.type || "MULTIPLE_CHOICE",
      questionText: qApp1.questionText,
      options: qApp1.options,
      correctAnswer: qApp1.correctAnswer,
      explanation: qApp1.explanation,
      distractorDiagnoses: qApp1.distractorDiagnoses,
      sourceDocument: concept.sourceDocument,
      sourcePage: concept.sourcePage
    });
    storage.addQuestion(question1);
    const question2 = shuffleQuestionOptions({
      id: `q-app2-${concept.id}`,
      conceptId: concept.id,
      subjectId: concept.subjectId,
      topicId: concept.topicId,
      category: qApp2.category || "APPLICATION",
      type: qApp2.type || "MULTIPLE_CHOICE",
      questionText: qApp2.questionText,
      options: qApp2.options,
      correctAnswer: qApp2.correctAnswer,
      explanation: qApp2.explanation,
      distractorDiagnoses: qApp2.distractorDiagnoses,
      sourceDocument: concept.sourceDocument,
      sourcePage: concept.sourcePage
    });
    storage.addQuestion(question2);
    const questionRecall = shuffleQuestionOptions({
      id: `q-recall-${concept.id}`,
      conceptId: concept.id,
      subjectId: concept.subjectId,
      topicId: concept.topicId,
      category: qRecall.category || "RECALL",
      type: qRecall.type || "MULTIPLE_CHOICE",
      questionText: qRecall.questionText,
      options: qRecall.options,
      correctAnswer: qRecall.correctAnswer,
      explanation: qRecall.explanation,
      distractorDiagnoses: qRecall.distractorDiagnoses,
      sourceDocument: concept.sourceDocument,
      sourcePage: concept.sourcePage
    });
    storage.addQuestion(questionRecall);
    const isMathSubject = isCalculationSubject(concept.subjectName || concept.subjectId, concept.formulas);
    const primaryMistake = teaching.commonMisconceptions?.[0]?.mistake || `Confusing ${concept.name} with an unrelated concept`;
    const secondaryMistake = teaching.commonMisconceptions?.[1]?.mistake || `Applying ${concept.name} without fulfilling required syllabus conditions`;
    const tertiaryMistake = teaching.commonMisconceptions?.[2]?.mistake || `Disregarding key contextual rules for ${concept.name}`;
    const misconceptionQuestion = shuffleQuestionOptions({
      id: `q-misc-${concept.id}`,
      conceptId: concept.id,
      subjectId: concept.subjectId,
      topicId: concept.topicId,
      category: "APPLICATION",
      type: "MULTIPLE_CHOICE",
      questionText: `Which of the following statements is valid according to ${concept.name}?`,
      options: [
        question1.correctAnswer,
        primaryMistake,
        secondaryMistake,
        tertiaryMistake
      ],
      correctAnswer: question1.correctAnswer,
      explanation: question1.explanation,
      distractorDiagnoses: {
        [primaryMistake]: "MISCONCEPTION",
        [secondaryMistake]: "KNOWLEDGE_GAP",
        [tertiaryMistake]: "CARELESS_ERROR"
      },
      sourcePage: concept.sourcePage
    });
    const pool = {
      conceptId: concept.id,
      explanation: {
        id: `act-explain-${concept.id}`,
        type: "EXPLAIN",
        title: teaching.title || `Understanding ${concept.name}`,
        instruction: "Review the core principles, illustrative examples, and common traps below.",
        content: explanationContent,
        sourcePage: concept.sourcePage
      },
      workedExample: {
        id: `act-example-${concept.id}`,
        type: "WORKED_EXAMPLE",
        title: `Official Worked Example for ${concept.name}`,
        instruction: "Follow how the rules combine systematically.",
        content: concept.examples?.length ? `### Step-by-Step School Notes Example

${concept.examples.join("\n\n")}` : isMathSubject ? `### Practical Demonstration
Apply the rule directly: identify known terms, substitute into the formula, and verify units.` : `### Practical Demonstration
Apply the syllabus principle directly: identify key factors, analyze the scenario, and verify that your conclusion is logically supported by the notes.`,
        sourcePage: concept.sourcePage
      },
      recallQuestion: {
        id: `act-recall-${concept.id}`,
        type: "RECALL",
        title: "Core Concept Retrieval",
        instruction: "Select the precise definition or governing rule.",
        content: `Check your retrieval of ${concept.name}:`,
        question: questionRecall
      },
      primaryApplication: {
        id: `act-app1-${concept.id}`,
        type: "APPLICATION",
        title: "Application Challenge",
        instruction: "Apply the principle to solve the problem.",
        content: `Solve the problem using ${concept.name}:`,
        question: question1
      },
      followUpApplication: {
        id: `act-app2-${concept.id}`,
        type: "APPLICATION",
        title: "Follow-Up Verification Challenge",
        instruction: "Confirm your mastery on a new scenario.",
        content: `Solve this follow-up question:`,
        question: question2
      },
      misconceptionCheck: {
        id: `act-misc-check-${concept.id}`,
        type: "MISCONCEPTION_CHECK",
        title: "Misconception Diagnostic Check",
        instruction: "Differentiate between the valid rule and the common error.",
        content: `Identify the valid statement regarding ${concept.name}:`,
        question: misconceptionQuestion
      },
      remediationActivities: {
        MISCONCEPTION: {
          id: `act-rem-misc-${concept.id}`,
          type: "REMEDIATION",
          title: `Targeted Remediation: Correcting Common Misconception`,
          instruction: "Pay close attention to why the common error fails.",
          content: `### \u{1F6A8} Why the Error Occurs

Students often confuse distinct principles when studying ${concept.name}.

\u2022 **Verified Rule**: ${question1.correctAnswer}

\u2022 **Common Pitfall**: ${primaryMistake}

*Rule of Thumb*: ${teaching.commonMisconceptions?.[0]?.clarification || "Always verify that preconditions match syllabus guidelines before answering."}`
        },
        CALCULATION_ERROR: {
          id: `act-rem-calc-${concept.id}`,
          type: "REMEDIATION",
          title: isMathSubject ? "Targeted Remediation: Step-by-Step Computation Check" : "Targeted Remediation: Step-by-Step Procedure Check",
          instruction: "Review the step-by-step execution procedure.",
          content: isMathSubject ? `### \u{1F6E0}\uFE0F Safe Calculation Blueprint

When solving numerical problems involving ${concept.name}:

1. **Isolate Terms First**: Separate constants, coefficients, and variables.
2. **Apply Verified Rules**: Apply ${concept.formulas?.[0] || "the governing formula"} step by step.
3. **Sanity Check Result**: Check signs, units, and boundary conditions.` : `### \u{1F6E0}\uFE0F Step-by-Step Analysis Blueprint

When addressing questions involving ${concept.name}:

1. **Identify Core Terms & Scope**: Distinguish key variables, conditions, and definitions involved in ${concept.name}.
2. **Apply Verified Syllabus Rules**: Apply ${concept.definitions?.[0] || "the verified syllabus principle"} step by step.
3. **Verify Conclusion**: Confirm that your answer directly addresses the prompt without confusing related concepts.`
        }
      },
      guidedPractice: {
        id: `act-guided-${concept.id}`,
        type: "GUIDED_PRACTICE",
        title: "Guided Practice: Step-by-Step Scaffolded Problem",
        instruction: "Solve this scaffolded problem step by step.",
        content: `Review the worked pattern from the syllabus:

\u2022 Step 1: Identify the relevant rule or definition: ${concept.formulas?.[0] || concept.definitions?.[0] || concept.name}
\u2022 Step 2: Apply syllabus criteria carefully.
\u2022 Step 3: Deduce final verified answer.

Now test this procedure on the challenge question below:`,
        question: question1
      }
    };
    this.activityPoolCache.set(concept.id, pool);
    return pool;
  }
  /**
   * Automated Three-Student Benchmark runner for verification.
   * Runs Student A (fast), Student B (average), or Student C (struggling)
   * and returns the exact execution trace and evidence outcome.
   */
  async simulateBenchmark(conceptId, profile) {
    const session = await this.startSession(conceptId, `sim-${profile}-${Date.now()}`, { forceNewStudent: true });
    const pool = await this.getOrCreateActivityPool(storage.getConcept(conceptId));
    const path2 = [];
    let iterations = 0;
    const maxIterations = 8;
    while (!session.isComplete && iterations < maxIterations) {
      iterations++;
      const current = session.currentActivity;
      path2.push(current.type);
      if (!current.question) {
        await this.processResponse(session.sessionId, "CONTINUE");
        continue;
      }
      let answerToSubmit = "";
      if (profile === "STUDENT_A") {
        answerToSubmit = current.question.correctAnswer;
      } else if (profile === "STUDENT_B") {
        if (session.evidence.totalAttempts === 0) {
          const calcDistractor = Object.keys(current.question.distractorDiagnoses || {}).find(
            (k) => current.question?.distractorDiagnoses?.[k] === "CALCULATION_ERROR"
          );
          answerToSubmit = calcDistractor || (current.question.options ? current.question.options[1] : "wrong_calculation");
        } else {
          answerToSubmit = current.question.correctAnswer;
        }
      } else if (profile === "STUDENT_C") {
        if (session.evidence.totalAttempts === 0) {
          const miscDistractor = Object.keys(current.question.distractorDiagnoses || {}).find(
            (k) => current.question?.distractorDiagnoses?.[k] === "MISCONCEPTION"
          );
          answerToSubmit = miscDistractor || (current.question.options ? current.question.options[0] === current.question.correctAnswer ? current.question.options[1] : current.question.options[0] : "misconception");
        } else {
          answerToSubmit = current.question.correctAnswer;
        }
      }
      await this.processResponse(session.sessionId, answerToSubmit);
    }
    if (session.currentActivity && session.currentActivity.type === "SUMMARY") {
      path2.push("SUMMARY");
    }
    const descriptions = {
      STUDENT_A: "Student A (Fast): Explanation \u2192 Correct Application \u2192 Follow-Up Verification \u2192 Fast-Track Mastery.",
      STUDENT_B: "Student B (Average): Explanation \u2192 Calculation Slip \u2192 Targeted Remediation \u2192 Correct Retry \u2192 Mastery.",
      STUDENT_C: "Student C (Struggling): Explanation \u2192 Misconception Slip \u2192 Mental Model Contrasting Remediation \u2192 Diagnostic Check \u2192 Application \u2192 Mastery."
    };
    return {
      profile,
      description: descriptions[profile],
      path: path2,
      history: session.history.map((h) => ({
        activityType: h.activityType,
        isCorrect: h.isCorrect,
        feedback: h.feedback
      })),
      finalMastery: session.masteryScore ?? 0,
      completed: session.isComplete,
      summary: session.summaryMessage || "Session completed."
    };
  }
};
var flexibleLessonEngine = new FlexibleLessonEngine();

// server/services/batchOnboardingService.ts
var import_mammoth = __toESM(require("mammoth"), 1);
var BatchOnboardingService = class {
  /**
   * Phase 1: Reads uploaded files, extracts text, and uses AI to classify into academic subjects.
   */
  async classifyUploadedFiles(files) {
    const processedFiles = [];
    const failedFiles = [];
    for (const [idx, file] of files.entries()) {
      try {
        let extractedText = "";
        let pageCount = 1;
        if (file.filename.toLowerCase().endsWith(".pdf")) {
          const pdfData = await extractTextFromPdfBuffer(file.buffer);
          extractedText = pdfData.text || "";
          pageCount = pdfData.pageCount || 1;
        } else if (file.filename.toLowerCase().endsWith(".docx")) {
          const docx = await import_mammoth.default.extractRawText({ buffer: file.buffer });
          extractedText = docx.value || "";
        } else if (file.filename.toLowerCase().endsWith(".doc")) {
          throw new Error("Legacy .doc files are not supported. Save the file as .docx or PDF.");
        } else {
          extractedText = file.buffer.toString("utf-8");
        }
        extractedText = extractedText.replace(/[^\x20-\x7E\r\n\t\u00A0-\uFFFF]/g, " ").trim();
        if (extractedText.startsWith("%PDF") || extractedText.includes("/Filter/FlateDecode")) {
          extractedText = "";
        }
        if (extractedText.length < 40) {
          failedFiles.push(file.filename);
          continue;
        }
        const excerpt = extractedText.slice(0, 2500);
        const fileId = `file_${Date.now()}_${idx}`;
        processedFiles.push({
          id: fileId,
          filename: file.filename,
          buffer: file.buffer,
          size: file.size,
          extractedText,
          pageCount,
          excerpt
        });
      } catch (err) {
        console.warn(`Failed to process file ${file.filename}:`, err);
        failedFiles.push(file.filename);
      }
    }
    if (processedFiles.length === 0) {
      throw new Error("No readable text could be extracted from the uploaded files.");
    }
    const classifications = await aiService.classifyDocuments(
      processedFiles.map((f) => ({
        id: f.id,
        filename: f.filename,
        excerpt: f.excerpt
      }))
    );
    const groupMap = /* @__PURE__ */ new Map();
    for (const file of processedFiles) {
      const classInfo = classifications.find((c) => c.docId === file.id);
      const subjectName = classInfo ? classInfo.subjectName : "General Studies";
      if (!groupMap.has(subjectName)) {
        groupMap.set(subjectName, []);
      }
      groupMap.get(subjectName).push({
        id: file.id,
        filename: file.filename,
        pageCount: file.pageCount,
        size: file.size,
        fullText: file.extractedText,
        textExcerpt: file.excerpt
      });
    }
    const groups = Array.from(groupMap.entries()).map(([subjectName, files2]) => ({
      subjectName,
      files: files2
    }));
    return {
      groups,
      totalFilesProcessed: processedFiles.length,
      failedFiles
    };
  }
  /**
   * Phase 2: Builds full curriculum hierarchy, connects source provenance, and initializes the study schedule.
   */
  async buildFullTermCurriculum(groups, termEndDate, targetStudyMinutesPerDay) {
    const readable = (groups || []).filter((g) => g.files.some((f) => (f.fullText || f.textExcerpt || "").trim().length >= 40));
    if (readable.length === 0) {
      throw new Error("None of these notes contain readable text, so your existing curriculum was kept.");
    }
    groups = readable;
    const snapshot = storage.snapshot();
    storage.startBatch();
    try {
      storage.resetCurriculum();
      const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      storage.updateSettings({
        termStartDate: todayStr,
        termEndDate,
        targetStudyMinutesPerDay: Number(targetStudyMinutesPerDay) || 120,
        onboardingCompleted: true
      });
      let totalTopics = 0;
      let totalConcepts = 0;
      let totalDocuments = 0;
      const createdSubjects = [];
      for (const [groupIdx, group] of groups.entries()) {
        const subjectId = `sub_${Date.now()}_${groupIdx}`;
        const subjectName = group.subjectName.trim() || "Academic Subject";
        const subject = {
          id: subjectId,
          name: subjectName,
          description: `Curriculum derived from ${group.files.length} school source document(s).`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        storage.addSubject(subject);
        createdSubjects.push(subject);
        let combinedText = "";
        for (const [fileIdx, file] of group.files.entries()) {
          totalDocuments++;
          const docId = `doc_${Date.now()}_${fileIdx}`;
          const docText = file.fullText || file.textExcerpt || "";
          combinedText += `

=== SOURCE FILE: ${file.filename} ===

` + docText;
          const docRecord = {
            id: docId,
            subjectId,
            title: file.filename.replace(/\.[a-zA-Z0-9]+$/i, ""),
            filename: file.filename,
            pageCount: file.pageCount || 1,
            uploadDate: (/* @__PURE__ */ new Date()).toISOString(),
            previewText: docText.slice(0, 300),
            extractedText: docText
          };
          storage.addDocument(docRecord);
        }
        try {
          const extracted = await aiService.extractCurriculum(subjectName, combinedText);
          if (extracted && extracted.topics && extracted.topics.length > 0) {
            for (const [topIdx, topData] of extracted.topics.entries()) {
              totalTopics++;
              const topicId = `top_${Date.now()}_${groupIdx}_${topIdx}`;
              storage.addTopic({
                id: topicId,
                subjectId,
                title: topData.title,
                order: topIdx + 1,
                description: topData.description || `Key syllabus topics for ${topData.title}`
              });
              if (topData.concepts && Array.isArray(topData.concepts)) {
                for (const [concIdx, c] of topData.concepts.entries()) {
                  totalConcepts++;
                  const conceptId = `conc_${Date.now()}_${groupIdx}_${topIdx}_${concIdx}`;
                  const sourceDocName = group.files[0]?.filename || "Uploaded Notes";
                  storage.addConcept({
                    id: conceptId,
                    topicId,
                    topicTitle: topData.title,
                    subtopicTitle: c.subtopicTitle || "",
                    subjectId,
                    subjectName,
                    name: c.name,
                    explanation: c.explanation,
                    definitions: c.definitions || [],
                    formulas: c.formulas || [],
                    keyFacts: c.keyFacts || [],
                    examples: c.examples || [],
                    sourceDocument: sourceDocName,
                    sourcePage: c.sourcePage || 1,
                    order: concIdx + 1,
                    prerequisiteConceptIds: []
                  });
                  if (c.sampleQuestions && Array.isArray(c.sampleQuestions)) {
                    for (const [qIdx, q] of c.sampleQuestions.entries()) {
                      const questionId = `q_${Date.now()}_${groupIdx}_${qIdx}`;
                      const newQ = shuffleQuestionOptions({
                        id: questionId,
                        conceptId,
                        subjectId,
                        topicId,
                        subtopicTitle: c.subtopicTitle || "",
                        category: q.category || "RECALL",
                        type: q.type || "MULTIPLE_CHOICE",
                        questionText: q.questionText || `Test question regarding ${c.name}`,
                        options: q.options || [],
                        correctAnswer: q.correctAnswer || (q.options?.[0] || "Option A"),
                        explanation: q.explanation || "Verified with source school notes.",
                        sourceDocument: sourceDocName,
                        sourcePage: c.sourcePage || 1
                      });
                      storage.addQuestion(newQ);
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          console.warn(`Curriculum extraction failed for subject ${subjectName}:`, err);
        }
      }
      if (totalConcepts === 0) {
        throw new Error("No concepts could be built from these notes. Your existing curriculum was kept.");
      }
      const initialPlan = plannerService.generateDailyPlan(targetStudyMinutesPerDay);
      return {
        success: true,
        summary: {
          subjectsCount: createdSubjects.length,
          topicsCount: totalTopics,
          conceptsCount: totalConcepts,
          documentsCount: totalDocuments
        },
        subjects: createdSubjects,
        initialPlan,
        settings: storage.getSettings()
      };
    } catch (err) {
      storage.restore(snapshot);
      throw err;
    } finally {
      storage.endBatch();
    }
  }
};
var batchOnboardingService = new BatchOnboardingService();

// server.ts
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "10mb" }));
var ACCESS_PASSWORD = process.env.APP_PASSWORD;
if (ACCESS_PASSWORD) {
  const digest = (v) => import_crypto.default.createHash("sha256").update(v).digest();
  app.use((req, res, next) => {
    if (req.path === "/api/health") return next();
    const [scheme, encoded] = (req.headers.authorization || "").split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf8");
      const pass = decoded.slice(decoded.indexOf(":") + 1);
      if (import_crypto.default.timingSafeEqual(digest(pass), digest(ACCESS_PASSWORD))) return next();
    }
    res.set("WWW-Authenticate", 'Basic realm="Termwise", charset="UTF-8"');
    res.status(401).send("Authentication required");
  });
}
if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    try {
      await storage.ready();
      await storage.refresh();
    } catch {
    }
    const end = res.end.bind(res);
    res.end = (...args) => {
      storage.flush().finally(() => end(...args));
      return res;
    };
    next();
  });
}
var upload = (0, import_multer.default)({ storage: import_multer.default.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } });
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/settings", (req, res) => {
  const settings = storage.getSettings();
  const end = new Date(settings.termEndDate);
  const now = /* @__PURE__ */ new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1e3 * 60 * 60 * 24)));
  const weeksRemaining = Math.floor(diffDays / 7);
  let countdownLabel = "";
  if (diffDays <= 0) {
    countdownLabel = "Term complete";
  } else if (diffDays === 1) {
    countdownLabel = "1 day until your term ends";
  } else if (diffDays < 7) {
    countdownLabel = `${diffDays} days until your term ends`;
  } else if (weeksRemaining === 1) {
    countdownLabel = "1 week until your term ends";
  } else {
    countdownLabel = `${weeksRemaining} weeks until your term ends`;
  }
  res.json({
    ...settings,
    daysRemaining: diffDays,
    weeksRemaining,
    countdownLabel
  });
});
app.post("/api/settings", (req, res) => {
  const b = req.body || {};
  const patch = {};
  const isDate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));
  if (b.termEndDate !== void 0) {
    if (!isDate(b.termEndDate)) return res.status(400).json({ error: "Term end date must be a valid date." });
    patch.termEndDate = b.termEndDate;
  }
  if (b.termStartDate !== void 0) {
    if (!isDate(b.termStartDate)) return res.status(400).json({ error: "Term start date must be a valid date." });
    patch.termStartDate = b.termStartDate;
  }
  if (b.targetStudyMinutesPerDay !== void 0) {
    const n = Number(b.targetStudyMinutesPerDay);
    if (!Number.isFinite(n) || n < 15 || n > 600) return res.status(400).json({ error: "Daily target must be between 15 and 600 minutes." });
    patch.targetStudyMinutesPerDay = Math.round(n);
  }
  if (b.masteryThreshold !== void 0) {
    const n = Number(b.masteryThreshold);
    if (!Number.isFinite(n) || n < 50 || n > 100) return res.status(400).json({ error: "Mastery threshold must be between 50 and 100." });
    patch.masteryThreshold = Math.round(n);
  }
  res.json(storage.updateSettings(patch));
});
app.post("/api/onboarding/classify-batch", upload.array("files", 20), async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }
    const input = files.map((f) => ({
      filename: f.originalname,
      buffer: f.buffer,
      size: f.size
    }));
    const result = await batchOnboardingService.classifyUploadedFiles(input);
    res.json(result);
  } catch (err) {
    console.error("Error classifying batch uploaded files:", err);
    res.status(500).json({ error: err?.message || "Failed to analyze uploaded files." });
  }
});
app.post("/api/onboarding/confirm-and-build", async (req, res) => {
  try {
    const { groups, termEndDate, targetStudyMinutesPerDay } = req.body;
    if (!groups || !Array.isArray(groups) || groups.length === 0) {
      return res.status(400).json({ error: "No classified subject groups provided." });
    }
    const result = await batchOnboardingService.buildFullTermCurriculum(
      groups,
      termEndDate || new Date(Date.now() + 90 * 24 * 3600 * 1e3).toISOString().split("T")[0],
      Number(targetStudyMinutesPerDay) || 120
    );
    res.json(result);
  } catch (err) {
    console.error("Error confirming and building onboarding curriculum:", err);
    res.status(500).json({ error: err?.message || "Failed to build curriculum and study schedule." });
  }
});
app.post("/api/onboarding/reset", (req, res) => {
  storage.resetCurriculum();
  res.json({ success: true, message: "Curriculum reset for new onboarding setup." });
});
app.post("/api/curriculum/reset", (req, res) => {
  storage.resetToSeed();
  res.json({ success: true, message: "Reset to standard school syllabus data." });
});
app.get("/api/curriculum/subjects", (req, res) => {
  res.json(storage.getSubjects());
});
app.get("/api/curriculum/topics", (req, res) => {
  const subjectId = req.query.subjectId;
  res.json(storage.getTopics(subjectId));
});
app.get("/api/curriculum/concepts", (req, res) => {
  const topicId = req.query.topicId;
  const subjectId = req.query.subjectId;
  const concepts = storage.getConcepts(topicId, subjectId);
  const allMastery = storage.getAllMastery();
  const enriched = concepts.map((c) => ({
    ...c,
    mastery: allMastery[c.id] || {
      score: 0,
      status: "UNLEARNED",
      repetitions: 0,
      totalAttempts: 0
    }
  }));
  res.json(enriched);
});
app.get("/api/curriculum/concept/:id", (req, res) => {
  const concept = storage.getConcept(req.params.id);
  if (!concept) {
    return res.status(404).json({ error: "Concept not found" });
  }
  const mastery = storage.getMastery(concept.id);
  const questions = storage.getQuestions(concept.id);
  const attempts = storage.getAttempts(concept.id);
  res.json({ concept, mastery, questions, attempts });
});
app.get("/api/curriculum/metrics", (req, res) => {
  const subjectId = req.query.subjectId;
  const metrics = masteryService.getCurriculumMetrics(subjectId);
  res.json(metrics);
});
app.post("/api/curriculum/import-text", async (req, res) => {
  storage.startBatch();
  try {
    const { subjectId, subjectName, notesText, sourceTitle } = req.body;
    if (!notesText || notesText.trim().length < 20) {
      storage.endBatch();
      return res.status(400).json({ error: "Notes content is too short to process." });
    }
    let targetSubject;
    if (subjectName && subjectName.trim()) {
      const trimmed = subjectName.trim();
      targetSubject = storage.getSubjects().find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
      if (!targetSubject) {
        targetSubject = {
          id: `sub-${Date.now()}`,
          name: trimmed,
          description: `Imported school notes for ${trimmed}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        storage.addSubject(targetSubject);
      }
    } else if (subjectId && subjectId !== "new") {
      targetSubject = storage.getSubject(subjectId);
    }
    if (!targetSubject) {
      const fallbackName = sourceTitle?.trim() || "General Coursework";
      targetSubject = {
        id: `sub-${Date.now()}`,
        name: fallbackName,
        description: `Imported notes for ${fallbackName}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      storage.addSubject(targetSubject);
    }
    const targetSubjectId = targetSubject.id;
    const docId = `doc-${Date.now()}`;
    const docTitle = sourceTitle || `${targetSubject.name} Notes`;
    storage.addDocument({
      id: docId,
      subjectId: targetSubjectId,
      title: docTitle,
      filename: `${docTitle.replace(/\s+/g, "_")}.txt`,
      uploadDate: (/* @__PURE__ */ new Date()).toISOString(),
      previewText: notesText.slice(0, 300)
    });
    const extracted = await aiProvider.extractCurriculum(targetSubject.name, notesText);
    if (extracted.inferredSubject && (!sourceTitle || targetSubject.name === "General Coursework")) {
      targetSubject.name = extracted.inferredSubject;
    }
    let conceptsAdded = 0;
    for (const [topicIndex, t] of extracted.topics.entries()) {
      const topicId = `top-${Date.now()}-${topicIndex}`;
      const newTopic = {
        id: topicId,
        subjectId: targetSubjectId,
        title: t.title,
        order: storage.getTopics(targetSubjectId).length + 1,
        description: t.description
      };
      storage.addTopic(newTopic);
      for (const [conceptIndex, c] of t.concepts.entries()) {
        const conceptId = `c-${Date.now()}-${topicIndex}-${conceptIndex}`;
        const newConcept = {
          id: conceptId,
          topicId,
          subjectId: targetSubjectId,
          name: c.name,
          subtopicTitle: c.subtopicTitle || "",
          topicTitle: t.title,
          subjectName: targetSubject.name,
          explanation: c.explanation,
          definitions: c.definitions || [],
          formulas: c.formulas || [],
          keyFacts: c.keyFacts || [],
          examples: c.examples || [],
          sourceDocument: docTitle,
          sourcePage: c.sourcePage || 1,
          order: conceptIndex + 1,
          prerequisiteConceptIds: [],
          prerequisiteNames: c.prerequisites || []
        };
        storage.addConcept(newConcept);
        conceptsAdded++;
        if (c.sampleQuestions && Array.isArray(c.sampleQuestions)) {
          for (const [qIdx, q] of c.sampleQuestions.entries()) {
            const newQ = {
              id: `q-${conceptId}-${qIdx}`,
              conceptId,
              subjectId: targetSubjectId,
              topicId,
              subtopicTitle: c.subtopicTitle || "",
              category: q.category || "RECALL",
              type: q.type || "MULTIPLE_CHOICE",
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              tolerance: q.tolerance,
              explanation: q.explanation || "Verified with school notes.",
              sourceDocument: docTitle,
              sourcePage: c.sourcePage || 1
            };
            storage.addQuestion(newQ);
          }
        }
      }
    }
    res.json({
      success: true,
      subjectId: targetSubjectId,
      topicsCount: extracted.topics.length,
      conceptsCount: conceptsAdded
    });
  } catch (err) {
    console.error("Error importing text notes:", err);
    res.status(500).json({ error: err.message || "Failed to process notes." });
  } finally {
    storage.endBatch();
  }
});
app.post("/api/curriculum/upload-pdf", upload.single("pdf"), async (req, res) => {
  storage.startBatch();
  try {
    if (!req.file) {
      storage.endBatch();
      return res.status(400).json({ error: "No PDF file uploaded." });
    }
    const { subjectId, subjectName } = req.body;
    let targetSubject;
    if (subjectName && subjectName.trim()) {
      const trimmed = subjectName.trim();
      targetSubject = storage.getSubjects().find(
        (s) => s.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (!targetSubject) {
        targetSubject = {
          id: `sub-${Date.now()}`,
          name: trimmed,
          description: `Imported from ${req.file.originalname}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        storage.addSubject(targetSubject);
      }
    } else if (subjectId && subjectId !== "new") {
      targetSubject = storage.getSubject(subjectId);
    }
    if (!targetSubject) {
      let inferred = req.file.originalname.replace(/\.[a-zA-Z0-9]+$/i, "").replace(/[-_]/g, " ").trim();
      inferred = inferred.split(" ").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      targetSubject = {
        id: `sub-${Date.now()}`,
        name: inferred || "Uploaded Course Notes",
        description: `Curriculum extracted from ${req.file.originalname}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      storage.addSubject(targetSubject);
    }
    const targetSubjectId = targetSubject.id;
    let extractedText = "";
    try {
      const pdfData = await extractTextFromPdfBuffer(req.file.buffer);
      extractedText = pdfData.text || "";
    } catch (parseErr) {
      console.warn("extractTextFromPdfBuffer failed, proceeding to multimodal fallback:", parseErr);
    }
    if (extractedText) {
      extractedText = extractedText.replace(/[^\x20-\x7E\r\n\t\u00A0-\uFFFF]/g, " ").trim();
      if (extractedText.startsWith("%PDF") || extractedText.includes("/Filter/FlateDecode")) {
        extractedText = "";
      }
    }
    const docId = `doc-${Date.now()}`;
    storage.addDocument({
      id: docId,
      subjectId: targetSubjectId,
      title: req.file.originalname.replace(/\.pdf$/i, ""),
      filename: req.file.originalname,
      uploadDate: (/* @__PURE__ */ new Date()).toISOString(),
      previewText: extractedText ? extractedText.slice(0, 400) : `School Syllabus PDF: ${req.file.originalname}`
    });
    const extracted = await aiProvider.extractCurriculum(
      targetSubject.name,
      extractedText,
      req.file.buffer
    );
    if (extracted.inferredSubject && (!req.body.subjectName || targetSubject.name === "Uploaded Course Notes")) {
      targetSubject.name = extracted.inferredSubject;
    }
    let conceptsAdded = 0;
    for (const [topicIndex, t] of extracted.topics.entries()) {
      const topicId = `top-${Date.now()}-${topicIndex}`;
      const newTopic = {
        id: topicId,
        subjectId: targetSubjectId,
        title: t.title,
        order: storage.getTopics(targetSubjectId).length + 1,
        description: t.description
      };
      storage.addTopic(newTopic);
      for (const [conceptIndex, c] of t.concepts.entries()) {
        const conceptId = `c-${Date.now()}-${topicIndex}-${conceptIndex}`;
        const newConcept = {
          id: conceptId,
          topicId,
          subjectId: targetSubjectId,
          name: c.name,
          subtopicTitle: c.subtopicTitle || "",
          topicTitle: t.title,
          subjectName: targetSubject.name,
          explanation: c.explanation,
          definitions: c.definitions || [],
          formulas: c.formulas || [],
          keyFacts: c.keyFacts || [],
          examples: c.examples || [],
          sourceDocument: req.file.originalname,
          sourcePage: c.sourcePage || 1,
          order: conceptIndex + 1,
          prerequisiteConceptIds: [],
          prerequisiteNames: c.prerequisites || []
        };
        storage.addConcept(newConcept);
        conceptsAdded++;
        if (c.sampleQuestions && Array.isArray(c.sampleQuestions)) {
          for (const [qIdx, q] of c.sampleQuestions.entries()) {
            const newQ = {
              id: `q-${conceptId}-${qIdx}`,
              conceptId,
              subjectId: targetSubjectId,
              topicId,
              subtopicTitle: c.subtopicTitle || "",
              category: q.category || "RECALL",
              type: q.type || "MULTIPLE_CHOICE",
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              tolerance: q.tolerance,
              explanation: q.explanation || "Directly aligned with notes.",
              sourceDocument: req.file.originalname,
              sourcePage: c.sourcePage || 1
            };
            storage.addQuestion(newQ);
          }
        }
      }
    }
    res.json({
      success: true,
      subjectId: targetSubjectId,
      filename: req.file.originalname,
      topicsCount: extracted.topics.length,
      conceptsCount: conceptsAdded
    });
  } catch (err) {
    console.error("PDF upload error:", err);
    res.status(500).json({ error: err.message || "Error processing uploaded PDF." });
  } finally {
    storage.endBatch();
  }
});
app.post("/api/curriculum/subjects", (req, res) => {
  try {
    const { name, description, code } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Subject name is required." });
    }
    const newSubject = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || `Course curriculum for ${name.trim()}`,
      code: code?.trim() || void 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    storage.addSubject(newSubject);
    res.json(newSubject);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create subject." });
  }
});
app.delete("/api/curriculum/subjects/:id", (req, res) => {
  try {
    storage.deleteSubject(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/curriculum/concepts/:id", (req, res) => {
  try {
    storage.deleteConcept(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/curriculum/topics/:id", (req, res) => {
  try {
    storage.deleteTopic(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/curriculum/documents", (req, res) => {
  const subjectId = req.query.subjectId;
  res.json(storage.getDocuments(subjectId).map(({ extractedText, ...doc }) => doc));
});
app.delete("/api/curriculum/documents/:id", (req, res) => {
  try {
    storage.deleteDocument(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/mistakes/:id", (req, res) => {
  try {
    storage.deleteMistake(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/curriculum/clear-all", (req, res) => {
  try {
    storage.clearAll();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/learn/lesson/start", async (req, res) => {
  try {
    const { conceptId, sessionId } = req.body;
    if (!conceptId) {
      return res.status(400).json({ error: "conceptId is required." });
    }
    const session = await flexibleLessonEngine.startSession(conceptId, sessionId);
    storage.saveSession(session);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to start lesson session." });
  }
});
app.post("/api/learn/lesson/respond", async (req, res) => {
  try {
    const { sessionId, studentAnswer } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required." });
    }
    const result = await flexibleLessonEngine.processResponse(sessionId, studentAnswer);
    if (result?.session) storage.saveSession(result.session);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to process lesson response." });
  }
});
app.get("/api/learn/lesson/session/:sessionId", (req, res) => {
  const session = flexibleLessonEngine.getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: "Lesson session not found." });
  }
  res.json(session);
});
app.post("/api/learn/lesson/explain-differently", async (req, res) => {
  try {
    const { conceptId } = req.body;
    if (!conceptId) {
      return res.status(400).json({ error: "conceptId is required." });
    }
    const concept = storage.getConcept(conceptId);
    if (!concept) {
      return res.status(404).json({ error: "Concept not found." });
    }
    const docs = storage.getDocuments().filter((d) => d.subjectId === concept.subjectId);
    const sourceText = docs.map((d) => d.extractedText).join("\n\n").slice(0, 3e3) || concept.explanation;
    const altExplanation = await aiProvider.generateAlternativeExplanation(concept, sourceText);
    res.json({ alternativeExplanation: altExplanation });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate alternative explanation." });
  }
});
app.get("/api/storage/supabase-status", (req, res) => {
  res.json(storage.getSupabaseStatus());
});
app.post("/api/learn/simulate-benchmark", async (req, res) => {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DIAGNOSTICS !== "true") {
    return res.status(404).json({ error: "Diagnostics are disabled on this deployment." });
  }
  try {
    const { conceptId, profile } = req.body;
    if (!conceptId) {
      return res.status(400).json({ error: "conceptId is required." });
    }
    const prof = profile || "STUDENT_A";
    const result = await flexibleLessonEngine.simulateBenchmark(conceptId, prof);
    res.json(result);
  } catch (err) {
    console.error("Benchmark simulation error:", err);
    res.status(500).json({ error: err.message || "Simulation failed." });
  }
});
app.get("/api/learn/lesson/:conceptId", async (req, res) => {
  try {
    const concept = storage.getConcept(req.params.conceptId);
    if (!concept) {
      return res.status(404).json({ error: "Concept not found" });
    }
    const session = await flexibleLessonEngine.startSession(concept.id);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to start lesson." });
  }
});
app.post("/api/learn/submit-attempt", async (req, res) => {
  try {
    const { questionId, studentAnswer, conceptId } = req.body;
    let question = storage.getQuestion(questionId);
    const concept = storage.getConcept(conceptId || (question ? question.conceptId : ""));
    if (!concept) {
      return res.status(404).json({ error: "Concept not found." });
    }
    if (!question) {
      question = {
        id: questionId || `q-temp-${Date.now()}`,
        conceptId: concept.id,
        subjectId: concept.subjectId,
        topicId: concept.topicId,
        category: "APPLICATION",
        type: "OPEN_EXPLANATION",
        questionText: `Evaluation for ${concept.name}`,
        correctAnswer: concept.definitions[0] || concept.explanation,
        explanation: concept.explanation
      };
    }
    let isCorrect = false;
    let score = 0;
    let feedback = "";
    let mistakeRecord = null;
    if (question.type === "MULTIPLE_CHOICE") {
      const studentClean = (studentAnswer || "").trim().toLowerCase();
      const correctClean = (question.correctAnswer || "").trim().toLowerCase();
      isCorrect = studentClean === correctClean;
      score = isCorrect ? 1 : 0;
      feedback = isCorrect ? `Correct. ${question.explanation}` : `Incorrect. Expected: "${question.correctAnswer}". ${question.explanation}`;
    } else if (question.type === "NUMERICAL") {
      const numMatch = numericMatches(studentAnswer, question.correctAnswer, question.tolerance);
      if (numMatch !== null) {
        isCorrect = numMatch;
        score = isCorrect ? 1 : 0;
        feedback = isCorrect ? `Correct calculation. Yields ${question.correctAnswer} ${question.units || ""}.` : `Calculation error. Your answer ${studentAnswer} differed from expected ${question.correctAnswer} ${question.units || ""}.`;
      } else {
        isCorrect = false;
        score = 0;
        feedback = "Please provide a valid numerical value.";
      }
    } else {
      const evaluation = await aiProvider.evaluateOpenAnswer(question, studentAnswer, concept);
      isCorrect = evaluation.isCorrect;
      score = evaluation.score;
      feedback = evaluation.feedback;
    }
    const updatedMastery = masteryService.updateMasteryOnAttempt(
      concept.id,
      isCorrect,
      question.category,
      score
    );
    if (!isCorrect) {
      mistakeRecord = await mistakeService.recordMistake(
        question,
        concept,
        studentAnswer
      );
    } else {
      const openMistakes = storage.getMistakes(false).filter((m) => m.conceptId === concept.id);
      for (const m of openMistakes) {
        storage.incrementMistakeAttempt(m.id, true);
      }
    }
    storage.recordAttempt({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      questionId: question.id,
      conceptId: concept.id,
      subjectId: concept.subjectId,
      studentAnswer,
      isCorrect,
      score,
      feedback,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({
      isCorrect,
      score,
      feedback,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      mastery: updatedMastery,
      mistakeRecord
    });
  } catch (err) {
    console.error("Error submitting attempt:", err);
    res.status(500).json({ error: err.message || "Error processing attempt." });
  }
});
app.get("/api/review/queue", (req, res) => {
  const subjectId = req.query.subjectId;
  const due = masteryService.getDueReviews(subjectId);
  res.json(due);
});
app.get("/api/mistakes", (req, res) => {
  const resolvedQuery = req.query.resolved;
  const resolved = resolvedQuery === "true" ? true : resolvedQuery === "false" ? false : void 0;
  const subjectId = req.query.subjectId;
  let mistakes = storage.getMistakes(resolved);
  if (subjectId) {
    mistakes = mistakes.filter((m) => m.subjectId === subjectId);
  }
  const stats = mistakeService.getMistakeStats(subjectId);
  res.json({ mistakes, stats });
});
app.post("/api/mistakes/:id/resolve", (req, res) => {
  storage.resolveMistake(req.params.id);
  res.json({ success: true });
});
app.get("/api/planner/today", (req, res) => {
  const minutes = parseInt(req.query.targetMinutes) || storage.getSettings().targetStudyMinutesPerDay || 90;
  const rawDate = req.query.date;
  const date = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : void 0;
  res.json(plannerService.generateDailyPlan(minutes, date));
});
app.post("/api/planner/toggle-item", (req, res) => {
  const { date, itemId } = req.body || {};
  if (!itemId) return res.status(400).json({ error: "itemId is required." });
  const targetDate = date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  storage.togglePlanItem(targetDate, itemId);
  res.json(storage.getDailyPlan(targetDate));
});
app.post("/api/tests/generate", async (req, res) => {
  try {
    const { subjectId, type, topicId } = req.body;
    let concepts = [];
    if (type === "CUMULATIVE_TEST") {
      const allConceptsInSubject = storage.getConcepts(void 0, subjectId);
      const allMastery = storage.getAllMastery();
      const covered = allConceptsInSubject.filter(
        (c) => allMastery[c.id] && allMastery[c.id].status !== "UNLEARNED" && allMastery[c.id].totalAttempts > 0
      );
      if (covered.length === 0) {
        return res.status(400).json({
          error: "No covered topics found! Go to the 'Learn' tab to study some concepts first before generating a Cumulative Test."
        });
      }
      concepts = covered;
    } else if (type === "TOPIC_TEST") {
      const topic = storage.getTopics(subjectId).find((t) => t.id === topicId);
      if (!topic) {
        return res.status(400).json({ error: "That topic does not belong to the selected subject." });
      }
      concepts = storage.getConcepts(topicId, subjectId);
    } else {
      concepts = storage.getConcepts(void 0, subjectId);
    }
    if (concepts.length === 0) {
      return res.status(400).json({ error: "There are no concepts to test in this selection yet." });
    }
    const shuffledConcepts = [...concepts].sort(() => 0.5 - Math.random());
    const selectedConcepts = shuffledConcepts.slice(0, Math.max(5, Math.min(10, shuffledConcepts.length)));
    const generatedQuestions = [];
    await Promise.all(selectedConcepts.map(async (concept, idx) => {
      const category = idx % 2 === 0 ? "RECALL" : "APPLICATION";
      const difficulty = idx === 0 ? "EASY" : idx < 3 ? "MEDIUM" : "HARD";
      let qPayload;
      try {
        qPayload = await aiProvider.generateQuestion(concept, category, difficulty);
      } catch {
        qPayload = generateSubjectAwareFallbackQuestion(concept, category, difficulty);
      }
      const qId = `test-q-${Date.now()}-${idx}`;
      const question = {
        id: qId,
        conceptId: concept.id,
        subjectId: concept.subjectId,
        topicId: concept.topicId,
        category: qPayload.category || category,
        type: qPayload.type || "MULTIPLE_CHOICE",
        questionText: qPayload.questionText,
        options: qPayload.options,
        correctAnswer: qPayload.correctAnswer,
        explanation: qPayload.explanation,
        distractorDiagnoses: qPayload.distractorDiagnoses,
        sourcePage: concept.sourcePage || 1
      };
      storage.addQuestion(question);
      generatedQuestions[idx] = {
        id: question.id,
        conceptId: question.conceptId,
        subjectId: question.subjectId,
        topicId: question.topicId,
        category: question.category,
        type: question.type,
        questionText: question.questionText,
        options: question.options,
        units: question.units,
        sourcePage: question.sourcePage
      };
    }));
    res.json({
      testId: `test-${Date.now()}`,
      type: type || "TOPIC_TEST",
      subjectId: subjectId || selectedConcepts[0]?.subjectId || "sub-general",
      questions: generatedQuestions
    });
  } catch (err) {
    console.error("Error generating dynamic test:", err);
    res.status(500).json({ error: err.message || "Failed to generate test." });
  }
});
app.post("/api/tests/submit", async (req, res) => {
  try {
    const { testId, subjectId, type, answers, durationMinutes } = req.body || {};
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "No answers were submitted." });
    }
    if (testId) {
      const already = storage.getTestRecords().find((r) => r.id === testId);
      if (already) return res.json(already);
    }
    const qMap = new Map(storage.getQuestions().map((q) => [q.id, q]));
    const graded = (await Promise.all(
      answers.map(async (ans) => {
        const q = qMap.get(ans?.questionId);
        if (!q) return null;
        const student = String(ans.studentAnswer ?? "");
        const concept = storage.getConcept(q.conceptId);
        let isCorrect = false;
        if (student.trim()) {
          if (q.type === "MULTIPLE_CHOICE") {
            isCorrect = student.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
          } else if (q.type === "NUMERICAL") {
            isCorrect = numericMatches(student, q.correctAnswer, q.tolerance) === true;
          } else {
            try {
              if (!concept) throw new Error("no concept");
              isCorrect = Boolean((await aiProvider.evaluateOpenAnswer(q, student, concept)).isCorrect);
            } catch {
              isCorrect = keywordOverlap(student, q.correctAnswer, q.explanation) >= 0.4;
            }
          }
        }
        return { q, concept, student, isCorrect };
      })
    )).filter(Boolean);
    if (graded.length === 0) {
      return res.status(400).json({ error: "None of the submitted questions were recognised." });
    }
    let correctCount = 0;
    const strongConcepts = /* @__PURE__ */ new Set();
    const weakConcepts = /* @__PURE__ */ new Set();
    const mistakeBreakdown = {};
    for (const { q, concept, student, isCorrect } of graded) {
      if (isCorrect) correctCount++;
      if (!concept) continue;
      if (isCorrect) {
        strongConcepts.add(concept.name);
        masteryService.updateMasteryOnAttempt(concept.id, true, q.category);
      } else {
        weakConcepts.add(concept.name);
        if (student.trim()) {
          masteryService.updateMasteryOnAttempt(concept.id, false, q.category);
          const mistake = await mistakeService.recordMistake(q, concept, student);
          mistakeBreakdown[mistake.mistakeType] = (mistakeBreakdown[mistake.mistakeType] || 0) + 1;
        }
      }
    }
    const totalQuestions = graded.length;
    const scorePercentage = Math.round(correctCount / totalQuestions * 100);
    const kind = type === "MOCK_EXAM" ? "Mock exam" : type === "CUMULATIVE_TEST" ? "Cumulative test" : "Topic test";
    const subjectName = storage.getSubject(subjectId)?.name;
    const testRecord = {
      id: testId || `test-${Date.now()}`,
      title: subjectName ? `${kind}: ${subjectName}` : kind,
      subjectId: subjectId || storage.getSubjects()[0]?.id || "",
      type: type || "TOPIC_TEST",
      totalQuestions,
      correctCount,
      scorePercentage,
      completedAt: (/* @__PURE__ */ new Date()).toISOString(),
      durationMinutes: Number.isFinite(Number(durationMinutes)) && Number(durationMinutes) > 0 ? Math.round(Number(durationMinutes)) : 0,
      strongConcepts: Array.from(strongConcepts),
      weakConcepts: Array.from(weakConcepts),
      mistakeBreakdown
    };
    storage.recordTest(testRecord);
    res.json(testRecord);
  } catch (err) {
    res.status(500).json({ error: err.message || "Error grading test." });
  }
});
app.get("/api/tests/history", (req, res) => {
  res.json(storage.getTestRecords());
});
var server_default = app;

// api/_source.ts
var source_default = server_default;
