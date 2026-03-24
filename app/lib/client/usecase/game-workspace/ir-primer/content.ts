import type { SupportedArcadeLocale } from "../../../../domain/entities/locale";
import type { GameplaySourceAttributionItem } from "../../../../../components/gameplay/shared/GameplaySourceAttribution";
import { irPrimerLocalizedContentByLocale } from "./content-translations";

export type IrPrimerStudyPage = {
  body: string;
  detail: string;
  key: string;
  sources: GameplaySourceAttributionItem[];
  title: string;
};

export type IrPrimerQuestionChoice = {
  content: string;
  isCorrect: boolean;
  key: string;
  label: string;
};

export type IrPrimerQuestion = {
  choices: IrPrimerQuestionChoice[];
  explanation: string;
  key: string;
  prompt: string;
  selectionMode: "multiple" | "single";
  sources: GameplaySourceAttributionItem[];
};

export type IrPrimerLocalizedContent = {
  questions: IrPrimerQuestion[];
  studyPages: IrPrimerStudyPage[];
};

export type IrPrimerSection = {
  key: string;
  questionKeys: string[];
  studyPageKeys: string[];
};

export type IrPrimerResolvedSection = {
  key: string;
  questions: IrPrimerQuestion[];
  studyPages: IrPrimerStudyPage[];
};

const bookHomeSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/",
  label: "Stanford IR book",
  title: "Introduction to Information Retrieval",
};

const booleanSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/boolean-retrieval-1.html",
  label: "Stanford IR book",
  title: "Boolean retrieval",
};

const booleanProcessingSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/processing-boolean-queries-1.html",
  label: "Stanford IR book",
  title: "Processing Boolean queries",
};

const vocabularySource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/the-term-vocabulary-and-postings-lists-1.html",
  label: "Stanford IR book",
  title: "The term vocabulary and postings lists",
};

const stopWordsSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/dropping-common-terms-stop-words-1.html",
  label: "Stanford IR book",
  title: "Dropping common terms: stop words",
};

const normalizationSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/normalization-equivalence-classing-of-terms-1.html",
  label: "Stanford IR book",
  title: "Normalization (equivalence classing of terms)",
};

const stemmingSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/stemming-and-lemmatization-1.html",
  label: "Stanford IR book",
  title: "Stemming and lemmatization",
};

const phraseSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/positional-postings-and-phrase-queries-1.html",
  label: "Stanford IR book",
  title: "Positional postings and phrase queries",
};

const tolerantSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/dictionaries-and-tolerant-retrieval-1.html",
  label: "Stanford IR book",
  title: "Dictionaries and tolerant retrieval",
};

const wildcardSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/wildcard-queries-1.html",
  label: "Stanford IR book",
  title: "Wildcard queries",
};

const permutermSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/permuterm-indexes-1.html",
  label: "Stanford IR book",
  title: "Permuterm indexes",
};

const wildcardKGramSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/k-gram-indexes-for-wildcard-queries-1.html",
  label: "Stanford IR book",
  title: "k-gram indexes for wildcard queries",
};

const spellingSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/spelling-correction-1.html",
  label: "Stanford IR book",
  title: "Spelling correction",
};

const editDistanceSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/edit-distance-1.html",
  label: "Stanford IR book",
  title: "Edit distance",
};

const spellingKGramSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/k-gram-indexes-for-spelling-correction-1.html",
  label: "Stanford IR book",
  title: "k-gram indexes for spelling correction",
};

const indexingSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/index-construction-1.html",
  label: "Stanford IR book",
  title: "Index construction",
};

const bsbiSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/blocked-sort-based-indexing-1.html",
  label: "Stanford IR book",
  title: "Blocked sort-based indexing",
};

const spimiSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/single-pass-in-memory-indexing-1.html",
  label: "Stanford IR book",
  title: "Single-pass in-memory indexing",
};

const scoringSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/scoring-term-weighting-and-the-vector-space-model-1.html",
  label: "Stanford IR book",
  title: "Scoring, term weighting and the vector space model",
};

const tfSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/term-frequency-and-weighting-1.html",
  label: "Stanford IR book",
  title: "Term frequency and weighting",
};

const idfSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/inverse-document-frequency-1.html",
  label: "Stanford IR book",
  title: "Inverse document frequency",
};

const tfIdfSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/tf-idf-weighting-1.html",
  label: "Stanford IR book",
  title: "Tf-idf weighting",
};

const vectorSpaceSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/the-vector-space-model-for-scoring-1.html",
  label: "Stanford IR book",
  title: "The vector space model for scoring",
};

const evaluationSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-in-information-retrieval-1.html",
  label: "Stanford IR book",
  title: "Evaluation in information retrieval",
};

const unrankedEvaluationSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-unranked-retrieval-sets-1.html",
  label: "Stanford IR book",
  title: "Evaluation of unranked retrieval sets",
};

const rankedEvaluationSource: GameplaySourceAttributionItem = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html",
  label: "Stanford IR book",
  title: "Evaluation of ranked retrieval results",
};

export const irPrimerStudyPages: IrPrimerStudyPage[] = [
  {
    key: "boolean-basics",
    title: "Boolean retrieval and inverted indexes",
    detail: "Start with what information retrieval means and how conjunctive Boolean search uses an inverted index.",
    body: [
      "## Search in one chapter",
      "",
      "The Stanford IR book defines information retrieval as finding material, usually **unstructured text documents**, that satisfies an information need from within large collections.",
      "",
      "The first retrieval model in the book is **Boolean retrieval**: a document either matches the query or it does not.",
      "",
      "### Core data structure",
      "",
      "- The central structure is the **inverted index**.",
      "- A dictionary maps each term to a postings list.",
      "- A postings list stores the document identifiers for documents containing that term.",
      "",
      "### Conjunctive query processing",
      "",
      "For `Brutus AND Calpurnia`, the system retrieves each postings list and intersects them.",
      "",
      "- The merge walk advances pointers through both sorted postings lists.",
      "- The intersection runs in `O(x + y)` for postings list lengths `x` and `y`.",
      "- For an `AND` query with multiple terms, the standard heuristic is to process terms in **increasing document frequency** so intermediate results stay small.",
    ].join("\n"),
    sources: [
      {
        ...bookHomeSource,
        note: "The book home page and table of contents establish this as the Stanford IR text used for the lesson.",
      },
      {
        ...booleanSource,
        note: "The Boolean retrieval chapter defines information retrieval, unstructured text, and the central role of the inverted index.",
      },
      {
        ...booleanProcessingSource,
        note: "The Boolean query processing section describes merge-based postings intersection and the increasing-document-frequency heuristic.",
      },
    ],
  },
  {
    key: "terms-postings",
    title: "Terms, normalization, and phrase support",
    detail: "Learn how text becomes indexed terms, why stop words are optional, and why phrase queries need more than document-only postings.",
    body: [
      "## From documents to terms",
      "",
      "The book summarizes four major steps in inverted index construction:",
      "",
      "1. collect the documents",
      "2. tokenize the text",
      "3. do linguistic preprocessing",
      "4. index the documents each term occurs in",
      "",
      "### Common preprocessing choices",
      "",
      "- **Stop words** are extremely common terms that some systems remove from the vocabulary.",
      "- The book notes that stop lists save space, but phrase queries such as `\"President of the United States\"` can lose meaning if stop words are dropped.",
      "- **Normalization** canonicalizes tokens so matches survive superficial differences such as punctuation or hyphenation.",
      "- **Stemming** is a crude heuristic that chops suffixes, while **lemmatization** uses vocabulary and morphology to return a dictionary form.",
      "",
      "### Phrase queries",
      "",
      "Phrase queries are not handled well by document-only postings lists.",
      "",
      "- Search engines commonly support phrase queries with double quotes.",
      "- A positional index stores term positions so the engine can verify that terms occur next to each other in the right order.",
      "- Biword indexes are another option, but positional indexes provide the general mechanism.",
    ].join("\n"),
    sources: [
      {
        ...vocabularySource,
        note: "This chapter lists the main steps of vocabulary and postings construction and motivates phrase-query support.",
      },
      {
        ...stopWordsSource,
        note: "The stop words section explains why stop lists can save space but can also damage phrase queries.",
      },
      {
        ...normalizationSource,
        note: "Normalization is defined as token canonicalization through equivalence classing.",
      },
      {
        ...stemmingSource,
        note: "The book distinguishes stemming from lemmatization and explains that stemming tends to increase recall while harming precision.",
      },
      {
        ...phraseSource,
        note: "The positional postings section explains why phrase queries need richer postings than plain document lists.",
      },
    ],
  },
  {
    key: "tolerant-retrieval",
    title: "Wildcard queries and spelling correction",
    detail: "Tolerant retrieval handles uncertainty in query spelling and surface form.",
    body: [
      "## When exact matching is too rigid",
      "",
      "The tolerant retrieval chapter focuses on queries that are imprecise because of spelling variation, typos, or partial knowledge.",
      "",
      "### Wildcard retrieval",
      "",
      "- A wildcard query such as `automat*` looks for term variants sharing a pattern.",
      "- A **permuterm index** augments each term with `$`, stores all rotations, and rotates a wildcard query so `*` appears at the end before lookup.",
      "- A **k-gram index** maps each k-gram to the vocabulary terms containing it.",
      "- k-gram wildcard retrieval needs a **post-filtering step** because k-gram matches can produce false positives that do not satisfy the original wildcard pattern.",
      "",
      "### Spelling correction",
      "",
      "- **Edit distance** is the minimum number of insertions, deletions, and substitutions needed to transform one string into another.",
      "- Exhaustively computing edit distance to every vocabulary term is too expensive.",
      "- The book therefore uses a k-gram index to find candidate terms sharing many k-grams with the query, then computes edit distance only on that candidate set.",
    ].join("\n"),
    sources: [
      {
        ...tolerantSource,
        note: "The chapter frames tolerant retrieval as robustness to wildcard queries, alternative spellings, and spelling errors.",
      },
      {
        ...wildcardSource,
        note: "The wildcard section explains trailing, leading, and general wildcard motivations.",
      },
      {
        ...permutermSource,
        note: "The permuterm section explains rotating wildcard queries after augmenting terms with `$`.",
      },
      {
        ...wildcardKGramSource,
        note: "The k-gram wildcard section explains gram-to-term postings and the required post-filter step.",
      },
      {
        ...spellingSource,
        note: "The spelling correction section frames edit distance and k-gram overlap as the two main steps.",
      },
      {
        ...editDistanceSource,
        note: "Edit distance is defined as the minimum number of insert, delete, and replace operations.",
      },
      {
        ...spellingKGramSource,
        note: "The spelling-correction k-gram section explains candidate generation before the final edit-distance ranking step.",
      },
    ],
  },
  {
    key: "index-construction",
    title: "BSBI and SPIMI",
    detail: "Large collections need block-oriented indexing algorithms that work with secondary storage.",
    body: [
      "## Why index construction changes at scale",
      "",
      "The book treats indexing as constrained by hardware: the indexer often cannot sort all intermediate data in memory.",
      "",
      "### Blocked sort-based indexing (BSBI)",
      "",
      "- BSBI segments the collection into fixed-size blocks.",
      "- Each block accumulates **termID-docID** pairs, sorts them in memory, inverts them into postings lists, and writes the block index to disk.",
      "- A final merge combines the intermediate block indexes.",
      "- Its dominant complexity is `Theta(T log T)` because sorting dominates.",
      "",
      "### Single-pass in-memory indexing (SPIMI)",
      "",
      "- SPIMI uses **terms instead of termIDs** inside a block.",
      "- It appends postings directly to dynamic postings lists rather than collecting all pairs and sorting them first.",
      "- Each block dictionary is sorted before the block is written so later merging stays simple.",
      "- The book gives SPIMI a linear `Theta(T)` time complexity because it avoids sorting tokens.",
    ].join("\n"),
    sources: [
      {
        ...indexingSource,
        note: "The chapter overview introduces index construction, hardware constraints, and the roles of BSBI and SPIMI.",
      },
      {
        ...bsbiSource,
        note: "The BSBI section explains block segmentation, in-memory sorting, on-disk block indexes, merging, and `Theta(T log T)` complexity.",
      },
      {
        ...spimiSource,
        note: "The SPIMI section explains direct postings growth, per-block dictionaries, and linear-time indexing.",
      },
    ],
  },
  {
    key: "ranking",
    title: "tf, idf, and vector space scoring",
    detail: "Ranking starts when matching alone is not enough and documents need to be ordered by how useful they are for the query.",
    body: [
      "## From matching to ranking",
      "",
      "The ranking chapters explain that large collections can return too many matching documents, so a search engine must assign scores and rank results.",
      "",
      "### Weighting terms",
      "",
      "- **Term frequency** $tf_{t,d}$ is the number of occurrences of term $t$ in document $d$.",
      "- The **bag of words** model keeps term counts but ignores exact word order.",
      "- **Document frequency** `df_t` counts how many documents contain a term.",
      "- **Inverse document frequency** is $idf_t = \\log(N / df_t)$, so rare terms get high idf and common terms get low idf.",
      "",
      "### tf-idf and vectors",
      "",
      "- The book defines $tf\text{-}idf_{t,d} = tf_{t,d} \\cdot idf_t$.",
      "- A term gets the most weight when it appears many times in a small number of documents.",
      "- Documents and queries can both be viewed as vectors in a common vector space.",
      "- Vector space scoring then compares those weighted vectors to rank results.",
    ].join("\n"),
    sources: [
      {
        ...scoringSource,
        note: "The scoring chapter motivates ranking and the move from Boolean matching to weighted document scoring.",
      },
      {
        ...tfSource,
        note: "The term-frequency section defines tf and the bag-of-words model.",
      },
      {
        ...idfSource,
        note: "The idf section defines `idf_t = log(N / df_t)` and explains why rare terms are more discriminative.",
      },
      {
        ...tfIdfSource,
        note: "The tf-idf section explains the composite weight and why it is highest for frequent-in-document, rare-in-collection terms.",
      },
      {
        ...vectorSpaceSource,
        note: "The vector-space chapter frames both queries and documents as vectors used for scoring.",
      },
    ],
  },
  {
    key: "evaluation",
    title: "Precision, recall, and ranked evaluation",
    detail: "Search systems are judged empirically, so evaluation metrics matter as much as indexing and ranking algorithms.",
    body: [
      "## Evaluation is part of the discipline",
      "",
      "The evaluation chapter says information retrieval is a highly empirical field: design choices such as stop lists, stemming, and idf weighting need representative evaluation.",
      "",
      "### Unranked result sets",
      "",
      "- **Precision** is the fraction of retrieved documents that are relevant.",
      "- **Recall** is the fraction of relevant documents that are retrieved.",
      "- **F1** is the balanced harmonic mean of precision and recall.",
      "- The book argues that **accuracy** is a poor IR metric because nonrelevant documents dominate collections.",
      "",
      "### Ranked result sets",
      "",
      "- Ranked evaluation looks at prefixes such as the top `k` results.",
      "- **Precision at k** focuses on early results, such as the first page.",
      "- **MAP** averages precision values measured at each point where a relevant document is retrieved, then averages again over queries.",
      "- The book notes that MAP is widely used because it gives a stable single-number summary across recall levels.",
    ].join("\n"),
    sources: [
      {
        ...evaluationSource,
        note: "The evaluation chapter frames IR as an empirical discipline and motivates both unranked and ranked metrics.",
      },
      {
        ...unrankedEvaluationSource,
        note: "The unranked evaluation section defines precision, recall, F1, and explains why accuracy is misleading for IR.",
      },
      {
        ...rankedEvaluationSource,
        note: "The ranked evaluation section defines precision at k and MAP for ranked retrieval.",
      },
    ],
  },
];

export const irPrimerQuestions: IrPrimerQuestion[] = [
  {
    key: "q1",
    prompt: "## How does the book define information retrieval at a high level?",
    selectionMode: "single",
    sources: [booleanSource],
    explanation: "The chapter defines IR as finding unstructured material that satisfies an information need from large collections.",
    choices: [
      { key: "a", label: "Option A", content: "Finding unstructured material that satisfies an information need from large collections", isCorrect: true },
      { key: "b", label: "Option B", content: "Executing SQL updates on structured database rows", isCorrect: false },
      { key: "c", label: "Option C", content: "Compressing every document into a hash table", isCorrect: false },
      { key: "d", label: "Option D", content: "Training a language model from scratch", isCorrect: false },
    ],
  },
  {
    key: "q2",
    prompt: "## Which data structure is central to Boolean retrieval?",
    selectionMode: "single",
    sources: [booleanSource],
    explanation: "The Boolean retrieval chapter introduces the inverted index as the central data structure.",
    choices: [
      { key: "a", label: "Option A", content: "Inverted index", isCorrect: true },
      { key: "b", label: "Option B", content: "Suffix automaton", isCorrect: false },
      { key: "c", label: "Option C", content: "ROC table", isCorrect: false },
      { key: "d", label: "Option D", content: "Confusion matrix", isCorrect: false },
    ],
  },
  {
    key: "q3",
    prompt: "## What heuristic does the book recommend for processing a conjunctive `AND` query with several terms?",
    selectionMode: "single",
    sources: [booleanProcessingSource],
    explanation: "The recommended heuristic is to process terms in increasing document frequency so intermediate results remain small.",
    choices: [
      { key: "a", label: "Option A", content: "Process terms in increasing document frequency", isCorrect: true },
      { key: "b", label: "Option B", content: "Process the longest postings list first", isCorrect: false },
      { key: "c", label: "Option C", content: "Always expand every term into synonyms before intersection", isCorrect: false },
      { key: "d", label: "Option D", content: "Convert every `AND` into a phrase query", isCorrect: false },
    ],
  },
  {
    key: "q4",
    prompt: "## Which steps are part of the major inverted-index construction pipeline? Select all that apply.",
    selectionMode: "multiple",
    sources: [vocabularySource],
    explanation: "The chapter lists document collection, tokenization, linguistic preprocessing, and indexing document occurrences as the major steps.",
    choices: [
      { key: "a", label: "Option A", content: "Collect the documents to be indexed", isCorrect: true },
      { key: "b", label: "Option B", content: "Tokenize the text", isCorrect: true },
      { key: "c", label: "Option C", content: "Do linguistic preprocessing of tokens", isCorrect: true },
      { key: "d", label: "Option D", content: "Index the documents each term occurs in", isCorrect: true },
    ],
  },
  {
    key: "q5",
    prompt: "## Which statement about stop words is accurate in the book?",
    selectionMode: "single",
    sources: [stopWordsSource],
    explanation: "The book notes that stop lists can save space, but phrase queries can lose meaning when stop words are removed.",
    choices: [
      { key: "a", label: "Option A", content: "Stop lists can save postings space, but they can damage phrase queries.", isCorrect: true },
      { key: "b", label: "Option B", content: "Stop words must always be indexed twice.", isCorrect: false },
      { key: "c", label: "Option C", content: "Modern web search relies on large 300-word stop lists by default.", isCorrect: false },
      { key: "d", label: "Option D", content: "Stop words are only relevant for image retrieval.", isCorrect: false },
    ],
  },
  {
    key: "q6",
    prompt: "## Which statement correctly contrasts stemming and lemmatization?",
    selectionMode: "single",
    sources: [stemmingSource],
    explanation: "Stemming is a crude heuristic that chops endings, whereas lemmatization uses vocabulary and morphology to return a lemma.",
    choices: [
      { key: "a", label: "Option A", content: "Stemming is heuristic suffix chopping, while lemmatization aims for the dictionary form via morphological analysis.", isCorrect: true },
      { key: "b", label: "Option B", content: "Stemming preserves more context than positional indexes.", isCorrect: false },
      { key: "c", label: "Option C", content: "Lemmatization always increases precision and recall for English in aggregate.", isCorrect: false },
      { key: "d", label: "Option D", content: "Both require phrase positions in every postings list.", isCorrect: false },
    ],
  },
  {
    key: "q7",
    prompt: "## Why are plain document-only postings lists not enough for phrase queries?",
    selectionMode: "single",
    sources: [phraseSource],
    explanation: "Phrase queries need evidence that terms occur near each other and in order, which plain document-only postings do not provide.",
    choices: [
      { key: "a", label: "Option A", content: "Because phrase queries need position information, not just document membership", isCorrect: true },
      { key: "b", label: "Option B", content: "Because phrase queries require only collection frequency", isCorrect: false },
      { key: "c", label: "Option C", content: "Because phrase queries cannot use inverted indexes", isCorrect: false },
      { key: "d", label: "Option D", content: "Because phrase queries are evaluated only with ROC curves", isCorrect: false },
    ],
  },
  {
    key: "q8",
    prompt: "## What does a permuterm index do for wildcard search?",
    selectionMode: "single",
    sources: [permutermSource],
    explanation: "A permuterm index augments terms with `$`, stores all rotations, and rotates the query so the wildcard ends the lookup string.",
    choices: [
      { key: "a", label: "Option A", content: "It stores all rotations of each augmented term so a wildcard can be rotated into a prefix lookup.", isCorrect: true },
      { key: "b", label: "Option B", content: "It replaces all wildcard queries with tf-idf weights.", isCorrect: false },
      { key: "c", label: "Option C", content: "It stores every postings list in reverse rank order.", isCorrect: false },
      { key: "d", label: "Option D", content: "It removes the need for a standard inverted index.", isCorrect: false },
    ],
  },
  {
    key: "q9",
    prompt: "## Which statements about a k-gram index for wildcard queries are correct? Select all that apply.",
    selectionMode: "multiple",
    sources: [wildcardKGramSource],
    explanation: "A k-gram index points from grams to vocabulary terms, can enumerate false positives, and therefore needs post-filtering against the original wildcard pattern.",
    choices: [
      { key: "a", label: "Option A", content: "It maps each k-gram to the vocabulary terms containing that k-gram.", isCorrect: true },
      { key: "b", label: "Option B", content: "It may enumerate terms that must be filtered against the original wildcard query.", isCorrect: true },
      { key: "c", label: "Option C", content: "It eliminates the need for checking the original wildcard pattern.", isCorrect: false },
      { key: "d", label: "Option D", content: "It is used only for ranked evaluation, not retrieval.", isCorrect: false },
    ],
  },
  {
    key: "q10",
    prompt: "## What is edit distance in the spelling-correction chapter?",
    selectionMode: "single",
    sources: [editDistanceSource],
    explanation: "Edit distance is the minimum number of insertions, deletions, and substitutions required to transform one string into another.",
    choices: [
      { key: "a", label: "Option A", content: "The minimum number of insert, delete, and substitute operations needed to transform one string into another", isCorrect: true },
      { key: "b", label: "Option B", content: "The number of postings shared by two query terms", isCorrect: false },
      { key: "c", label: "Option C", content: "The number of documents removed by a stop list", isCorrect: false },
      { key: "d", label: "Option D", content: "The log of document frequency", isCorrect: false },
    ],
  },
  {
    key: "q11",
    prompt: "## How does the book use k-gram indexes for spelling correction?",
    selectionMode: "single",
    sources: [spellingSource, spellingKGramSource],
    explanation: "The book first uses k-gram overlap to produce candidate terms, then computes edit distance on that smaller candidate set.",
    choices: [
      { key: "a", label: "Option A", content: "Use k-gram overlap to generate candidates, then compute edit distance on the candidates.", isCorrect: true },
      { key: "b", label: "Option B", content: "Use edit distance first on the whole vocabulary, then build k-grams later.", isCorrect: false },
      { key: "c", label: "Option C", content: "Replace query terms directly with the highest collection-frequency term.", isCorrect: false },
      { key: "d", label: "Option D", content: "Treat every candidate with one matching k-gram as equally plausible.", isCorrect: false },
    ],
  },
  {
    key: "q12",
    prompt: "## Which actions belong to blocked sort-based indexing (BSBI)? Select all that apply.",
    selectionMode: "multiple",
    sources: [bsbiSource],
    explanation: "BSBI segments into blocks, sorts each block's termID-docID pairs in memory, writes intermediate indexes to disk, and merges them later.",
    choices: [
      { key: "a", label: "Option A", content: "Segment the collection into blocks", isCorrect: true },
      { key: "b", label: "Option B", content: "Sort each block's termID-docID pairs in memory", isCorrect: true },
      { key: "c", label: "Option C", content: "Write intermediate block indexes to disk", isCorrect: true },
      { key: "d", label: "Option D", content: "Merge the block indexes into a final index", isCorrect: true },
    ],
  },
  {
    key: "q13",
    prompt: "## Which statement distinguishes SPIMI from BSBI?",
    selectionMode: "single",
    sources: [spimiSource],
    explanation: "SPIMI uses terms instead of termIDs inside a block and appends postings directly rather than sorting all token pairs first.",
    choices: [
      { key: "a", label: "Option A", content: "SPIMI adds postings directly to dynamic postings lists instead of sorting all termID-docID pairs first.", isCorrect: true },
      { key: "b", label: "Option B", content: "SPIMI requires two full passes through the collection before any indexing can start.", isCorrect: false },
      { key: "c", label: "Option C", content: "SPIMI avoids writing blocks to disk.", isCorrect: false },
      { key: "d", label: "Option D", content: "SPIMI is defined only for phrase indexes.", isCorrect: false },
    ],
  },
  {
    key: "q14",
    prompt: "## Which complexity pairing matches the book?",
    selectionMode: "single",
    sources: [bsbiSource, spimiSource],
    explanation: "The book gives BSBI a dominant $\\Theta(T \\log T)$ sorting cost and SPIMI a linear $\\Theta(T)$ cost.",
    choices: [
      { key: "a", label: "Option A", content: "BSBI: $\\Theta(T \\log T)$ and SPIMI: $\\Theta(T)$", isCorrect: true },
      { key: "b", label: "Option B", content: "BSBI: $\\Theta(T)$ and SPIMI: $\\Theta(T \\log T)$", isCorrect: false },
      { key: "c", label: "Option C", content: "Both are $\\Theta(\\log T)$", isCorrect: false },
      { key: "d", label: "Option D", content: "Both are quadratic in the collection size", isCorrect: false },
    ],
  },
  {
    key: "q15",
    prompt: "## Which statements about tf, idf, and tf-idf are correct? Select all that apply.",
    selectionMode: "multiple",
    sources: [tfSource, idfSource, tfIdfSource],
    explanation: "tf counts occurrences in a document, idf downweights common terms with $\\log(N / df_t)$, and tf-idf multiplies the two.",
    choices: [
      { key: "a", label: "Option A", content: "$tf_{t,d}$ is the number of occurrences of term $t$ in document $d$.", isCorrect: true },
      { key: "b", label: "Option B", content: "$idf_t = \\log(N / df_t)$.", isCorrect: true },
      { key: "c", label: "Option C", content: "$tf\text{-}idf_{t,d} = tf_{t,d} \\cdot idf_t$.", isCorrect: true },
      { key: "d", label: "Option D", content: "A term occurring in almost every document should receive the highest idf.", isCorrect: false },
    ],
  },
  {
    key: "q16",
    prompt: "## In the book's ranking model, when does a term get especially high tf-idf weight?",
    selectionMode: "single",
    sources: [tfIdfSource],
    explanation: "tf-idf is highest when a term occurs many times in a small number of documents.",
    choices: [
      { key: "a", label: "Option A", content: "When it occurs many times in a small number of documents", isCorrect: true },
      { key: "b", label: "Option B", content: "When it is a stop word present in almost all documents", isCorrect: false },
      { key: "c", label: "Option C", content: "When it never occurs in the query", isCorrect: false },
      { key: "d", label: "Option D", content: "When it appears only in metadata zones and nowhere else", isCorrect: false },
    ],
  },
  {
    key: "q17",
    prompt: "## Which statement about unranked evaluation is correct?",
    selectionMode: "single",
    sources: [unrankedEvaluationSource],
    explanation: "Precision is the fraction of retrieved documents that are relevant, whereas recall is the fraction of relevant documents that are retrieved.",
    choices: [
      { key: "a", label: "Option A", content: "Precision is the fraction of retrieved documents that are relevant.", isCorrect: true },
      { key: "b", label: "Option B", content: "Recall is the fraction of retrieved documents that are nonrelevant.", isCorrect: false },
      { key: "c", label: "Option C", content: "Accuracy is the preferred primary IR metric because nonrelevant documents are rare.", isCorrect: false },
      { key: "d", label: "Option D", content: "F1 is the arithmetic mean of precision and recall.", isCorrect: false },
    ],
  },
  {
    key: "q18",
    prompt: "## Which statements about ranked evaluation are accurate? Select all that apply.",
    selectionMode: "multiple",
    sources: [rankedEvaluationSource],
    explanation: "The ranked-evaluation chapter defines Precision at k over the top results and MAP as the average of precision values at each relevant hit, averaged over queries.",
    choices: [
      { key: "a", label: "Option A", content: "Precision at `k` evaluates the top `k` ranked results.", isCorrect: true },
      { key: "b", label: "Option B", content: "MAP averages precision values measured where relevant documents are retrieved, then averages across queries.", isCorrect: true },
      { key: "c", label: "Option C", content: "MAP ignores ranked order and treats retrieval as an unordered set only.", isCorrect: false },
      { key: "d", label: "Option D", content: "Precision at `k` was designed mainly for the early-result use case such as web search.", isCorrect: true },
    ],
  },
];

export const irPrimerQuestionCount = irPrimerQuestions.length;

export const irPrimerStudyPageCount = irPrimerStudyPages.length;

export const irPrimerSections: IrPrimerSection[] = [
  {
    key: "boolean-basics",
    questionKeys: ["q1", "q2", "q3"],
    studyPageKeys: ["boolean-basics"],
  },
  {
    key: "terms-postings",
    questionKeys: ["q4", "q5", "q6", "q7"],
    studyPageKeys: ["terms-postings"],
  },
  {
    key: "tolerant-retrieval",
    questionKeys: ["q8", "q9", "q10", "q11"],
    studyPageKeys: ["tolerant-retrieval"],
  },
  {
    key: "index-construction",
    questionKeys: ["q12", "q13", "q14"],
    studyPageKeys: ["index-construction"],
  },
  {
    key: "ranking",
    questionKeys: ["q15", "q16"],
    studyPageKeys: ["ranking"],
  },
  {
    key: "evaluation",
    questionKeys: ["q17", "q18"],
    studyPageKeys: ["evaluation"],
  },
];

export const irPrimerSectionCount = irPrimerSections.length;

export function getIrPrimerSections(content: IrPrimerLocalizedContent): IrPrimerResolvedSection[] {
  const pagesByKey = new Map(content.studyPages.map((page) => [page.key, page]));
  const questionsByKey = new Map(content.questions.map((question) => [question.key, question]));

  return irPrimerSections.map((section) => ({
    key: section.key,
    questions: section.questionKeys.flatMap((key) => {
      const question = questionsByKey.get(key);

      return question ? [question] : [];
    }),
    studyPages: section.studyPageKeys.flatMap((key) => {
      const page = pagesByKey.get(key);

      return page ? [page] : [];
    }),
  }));
}

export function getIrPrimerContent(locale: SupportedArcadeLocale): IrPrimerLocalizedContent {
  const localizedContent = irPrimerLocalizedContentByLocale[locale];

  return {
    questions: localizedContent?.questions ?? irPrimerQuestions,
    studyPages: localizedContent?.studyPages ?? irPrimerStudyPages,
  };
}

export const irPrimerTimeLimitByDifficulty = {
  EASY: 900,
  NORMAL: 720,
  HARD: 600,
  EXPERT: 480,
} as const;