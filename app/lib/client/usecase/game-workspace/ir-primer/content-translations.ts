import type { SupportedArcadeLocale } from "../../../../domain/entities/locale";
import type { IrPrimerLocalizedContent } from "./content";

const booleanSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/boolean-retrieval-1.html",
  label: "公開ドキュメント",
  title: "Boolean retrieval",
  note: "この章では information retrieval の定義、Boolean retrieval の考え方、inverted index の中心的な役割を説明している。",
} as const;

const booleanProcessingSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/processing-boolean-queries-1.html",
  label: "公開ドキュメント",
  title: "Processing Boolean queries",
  note: "この節では postings intersection の進め方と、document frequency が小さい順に処理する heuristic を説明している。",
} as const;

const vocabularySourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/the-term-vocabulary-and-postings-lists-1.html",
  label: "公開ドキュメント",
  title: "The term vocabulary and postings lists",
  note: "この章では indexing pipeline と postings list の基本構造を整理している。",
} as const;

const stopWordsSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/dropping-common-terms-stop-words-1.html",
  label: "公開ドキュメント",
  title: "Dropping common terms: stop words",
  note: "stop words を落とす利点と、phrase query の意味を壊しうる点を説明している。",
} as const;

const normalizationSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/normalization-equivalence-classing-of-terms-1.html",
  label: "公開ドキュメント",
  title: "Normalization (equivalence classing of terms)",
  note: "Normalization を表記ゆれの吸収として定義している。",
} as const;

const stemmingSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/stemming-and-lemmatization-1.html",
  label: "公開ドキュメント",
  title: "Stemming and lemmatization",
  note: "stemming と lemmatization の違いと、それぞれの粗さや目的を比較している。",
} as const;

const phraseSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/positional-postings-and-phrase-queries-1.html",
  label: "公開ドキュメント",
  title: "Positional postings and phrase queries",
  note: "phrase query に positional index が必要な理由を説明している。",
} as const;

const tolerantSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/dictionaries-and-tolerant-retrieval-1.html",
  label: "公開ドキュメント",
  title: "Dictionaries and tolerant retrieval",
  note: "tolerant retrieval が wildcard query や spelling error にどう対応するかを導入している。",
} as const;

const wildcardSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/wildcard-queries-1.html",
  label: "公開ドキュメント",
  title: "Wildcard queries",
  note: "wildcard query の動機と代表的な扱い方を説明している。",
} as const;

const permutermSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/permuterm-indexes-1.html",
  label: "公開ドキュメント",
  title: "Permuterm indexes",
  note: "permuterm index で回転済み term を使い prefix lookup に落とし込む方法を示している。",
} as const;

const wildcardKGramSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/k-gram-indexes-for-wildcard-queries-1.html",
  label: "公開ドキュメント",
  title: "k-gram indexes for wildcard queries",
  note: "k-gram index の gram-to-term 対応と post-filtering の必要性を説明している。",
} as const;

const spellingSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/spelling-correction-1.html",
  label: "公開ドキュメント",
  title: "Spelling correction",
  note: "spelling correction を edit distance と candidate generation の流れで説明している。",
} as const;

const editDistanceSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/edit-distance-1.html",
  label: "公開ドキュメント",
  title: "Edit distance",
  note: "edit distance を insert、delete、substitute による最小操作回数として定義している。",
} as const;

const spellingKGramSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/k-gram-indexes-for-spelling-correction-1.html",
  label: "公開ドキュメント",
  title: "k-gram indexes for spelling correction",
  note: "k-gram overlap で候補を絞ってから edit distance を計算する流れを説明している。",
} as const;

const indexingSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/index-construction-1.html",
  label: "公開ドキュメント",
  title: "Index construction",
  note: "index construction を hardware 制約と block-oriented algorithm の観点から導入している。",
} as const;

const bsbiSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/blocked-sort-based-indexing-1.html",
  label: "公開ドキュメント",
  title: "Blocked sort-based indexing",
  note: "BSBI の block 分割、sorting、disk 書き出し、merge を説明している。",
} as const;

const spimiSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/single-pass-in-memory-indexing-1.html",
  label: "公開ドキュメント",
  title: "Single-pass in-memory indexing",
  note: "SPIMI の dynamic postings list と線形時間の特徴を説明している。",
} as const;

const scoringSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/scoring-term-weighting-and-the-vector-space-model-1.html",
  label: "公開ドキュメント",
  title: "Scoring, term weighting and the vector space model",
  note: "ranking が必要になる理由と weighted scoring への移行を説明している。",
} as const;

const tfSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/term-frequency-and-weighting-1.html",
  label: "公開ドキュメント",
  title: "Term frequency and weighting",
  note: "tf と bag of words model の基礎を定義している。",
} as const;

const idfSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/inverse-document-frequency-1.html",
  label: "公開ドキュメント",
  title: "Inverse document frequency",
  note: "idf と rare term が高く評価される理由を説明している。",
} as const;

const tfIdfSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/tf-idf-weighting-1.html",
  label: "公開ドキュメント",
  title: "Tf-idf weighting",
  note: "tf-idf の組み合わせと、高重みになる条件を説明している。",
} as const;

const vectorSpaceSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/the-vector-space-model-for-scoring-1.html",
  label: "公開ドキュメント",
  title: "The vector space model for scoring",
  note: "document と query を共通の vector space に置く考え方を説明している。",
} as const;

const evaluationSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-in-information-retrieval-1.html",
  label: "公開ドキュメント",
  title: "Evaluation in information retrieval",
  note: "IR を empirical な分野として位置づけ、evaluation の必要性を説明している。",
} as const;

const unrankedEvaluationSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-unranked-retrieval-sets-1.html",
  label: "公開ドキュメント",
  title: "Evaluation of unranked retrieval sets",
  note: "Precision、Recall、F1 と accuracy が不向きな理由を定義している。",
} as const;

const rankedEvaluationSourceJa = {
  href: "https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html",
  label: "公開ドキュメント",
  title: "Evaluation of ranked retrieval results",
  note: "Precision at k と MAP の定義、および早い順位の重要性を説明している。",
} as const;

const booleanSourceZh = { ...booleanSourceJa, label: "公开文档", note: "本章定义了 information retrieval、Boolean retrieval，以及 inverted index 的核心作用。" } as const;
const booleanProcessingSourceZh = { ...booleanProcessingSourceJa, label: "公开文档", note: "本节说明了 postings intersection 的处理方式，以及按较小 document frequency 先处理的 heuristic。" } as const;
const vocabularySourceZh = { ...vocabularySourceJa, label: "公开文档", note: "本章整理了 indexing pipeline 和 postings list 的基本结构。" } as const;
const stopWordsSourceZh = { ...stopWordsSourceJa, label: "公开文档", note: "说明了删除 stop words 的收益，以及它可能破坏 phrase query 语义。" } as const;
const normalizationSourceZh = { ...normalizationSourceJa, label: "公开文档", note: "把 Normalization 定义为吸收表面差异的规范化过程。" } as const;
const stemmingSourceZh = { ...stemmingSourceJa, label: "公开文档", note: "比较了 stemming 与 lemmatization 的差别及其目标。" } as const;
const phraseSourceZh = { ...phraseSourceJa, label: "公开文档", note: "说明了为什么 phrase query 需要 positional index。" } as const;
const tolerantSourceZh = { ...tolerantSourceJa, label: "公开文档", note: "引入 tolerant retrieval 如何应对 wildcard query 和 spelling error。" } as const;
const wildcardSourceZh = { ...wildcardSourceJa, label: "公开文档", note: "说明 wildcard query 的动机和基本处理方式。" } as const;
const permutermSourceZh = { ...permutermSourceJa, label: "公开文档", note: "说明 permuterm index 如何把旋转后的 term 转成 prefix lookup。" } as const;
const wildcardKGramSourceZh = { ...wildcardKGramSourceJa, label: "公开文档", note: "说明 k-gram index 的 gram-to-term 对应关系，以及 post-filtering 的必要性。" } as const;
const spellingSourceZh = { ...spellingSourceJa, label: "公开文档", note: "用 edit distance 和候选生成的流程说明 spelling correction。" } as const;
const editDistanceSourceZh = { ...editDistanceSourceJa, label: "公开文档", note: "把 edit distance 定义为 insert、delete、substitute 的最少操作数。" } as const;
const spellingKGramSourceZh = { ...spellingKGramSourceJa, label: "公开文档", note: "说明先用 k-gram overlap 缩小候选，再计算 edit distance。" } as const;
const indexingSourceZh = { ...indexingSourceJa, label: "公开文档", note: "从 hardware 限制与 block-oriented algorithm 的角度引入 index construction。" } as const;
const bsbiSourceZh = { ...bsbiSourceJa, label: "公开文档", note: "说明 BSBI 的 block 切分、sorting、写盘和 merge。" } as const;
const spimiSourceZh = { ...spimiSourceJa, label: "公开文档", note: "说明 SPIMI 的 dynamic postings list 和线性时间特征。" } as const;
const scoringSourceZh = { ...scoringSourceJa, label: "公开文档", note: "说明为什么需要 ranking，以及如何进入 weighted scoring。" } as const;
const tfSourceZh = { ...tfSourceJa, label: "公开文档", note: "定义 tf 和 bag of words model 的基础。" } as const;
const idfSourceZh = { ...idfSourceJa, label: "公开文档", note: "解释 idf 以及 rare term 为什么更有区分力。" } as const;
const tfIdfSourceZh = { ...tfIdfSourceJa, label: "公开文档", note: "说明 tf-idf 的组合方式以及高权重出现的条件。" } as const;
const vectorSpaceSourceZh = { ...vectorSpaceSourceJa, label: "公开文档", note: "说明 document 和 query 共享同一个 vector space 的想法。" } as const;
const evaluationSourceZh = { ...evaluationSourceJa, label: "公开文档", note: "把 IR 描述为 empirical 领域，并说明 evaluation 的必要性。" } as const;
const unrankedEvaluationSourceZh = { ...unrankedEvaluationSourceJa, label: "公开文档", note: "定义 Precision、Recall、F1，以及 accuracy 不适合作为 IR 指标的原因。" } as const;
const rankedEvaluationSourceZh = { ...rankedEvaluationSourceJa, label: "公开文档", note: "定义 Precision at k、MAP，以及早期排名结果的重要性。" } as const;

const booleanSourceFr = { ...booleanSourceJa, label: "Documentation publique", note: "Ce chapitre definit information retrieval, Boolean retrieval et le role central de l'inverted index." } as const;
const booleanProcessingSourceFr = { ...booleanProcessingSourceJa, label: "Documentation publique", note: "Cette section explique postings intersection et l'heuristic consistant a traiter d'abord les plus petits document frequency." } as const;
const vocabularySourceFr = { ...vocabularySourceJa, label: "Documentation publique", note: "Ce chapitre presente l'indexing pipeline et la structure de base d'une postings list." } as const;
const stopWordsSourceFr = { ...stopWordsSourceJa, label: "Documentation publique", note: "Il explique le gain de place des stop words et le risque pour la signification d'une phrase query." } as const;
const normalizationSourceFr = { ...normalizationSourceJa, label: "Documentation publique", note: "Normalization y est definie comme la reduction des variations de surface." } as const;
const stemmingSourceFr = { ...stemmingSourceJa, label: "Documentation publique", note: "Le chapitre compare stemming et lemmatization ainsi que leurs objectifs." } as const;
const phraseSourceFr = { ...phraseSourceJa, label: "Documentation publique", note: "Cette section explique pourquoi une phrase query a besoin d'un positional index." } as const;
const tolerantSourceFr = { ...tolerantSourceJa, label: "Documentation publique", note: "Elle introduit tolerant retrieval pour les wildcard query et les spelling error." } as const;
const wildcardSourceFr = { ...wildcardSourceJa, label: "Documentation publique", note: "Elle explique la motivation des wildcard query et leur traitement general." } as const;
const permutermSourceFr = { ...permutermSourceJa, label: "Documentation publique", note: "Elle montre comment un permuterm index transforme la recherche en prefix lookup." } as const;
const wildcardKGramSourceFr = { ...wildcardKGramSourceJa, label: "Documentation publique", note: "Elle decrit la relation gram-to-term et la necessite du post-filtering." } as const;
const spellingSourceFr = { ...spellingSourceJa, label: "Documentation publique", note: "Elle presente spelling correction comme une combinaison de candidats et de edit distance." } as const;
const editDistanceSourceFr = { ...editDistanceSourceJa, label: "Documentation publique", note: "Elle definit edit distance comme le nombre minimal d'insert, delete et substitute." } as const;
const spellingKGramSourceFr = { ...spellingKGramSourceJa, label: "Documentation publique", note: "Elle explique qu'on reduit d'abord les candidats via k-gram overlap avant de calculer edit distance." } as const;
const indexingSourceFr = { ...indexingSourceJa, label: "Documentation publique", note: "Le chapitre introduit index construction a partir des contraintes materielle et des algorithmes par blocs." } as const;
const bsbiSourceFr = { ...bsbiSourceJa, label: "Documentation publique", note: "Il decrit le decoupage en blocs, le sorting, l'ecriture disque et le merge de BSBI." } as const;
const spimiSourceFr = { ...spimiSourceJa, label: "Documentation publique", note: "Il decrit les dynamic postings list de SPIMI et son comportement lineaire." } as const;
const scoringSourceFr = { ...scoringSourceJa, label: "Documentation publique", note: "Il explique pourquoi le ranking est necessaire et comment passer a un weighted scoring." } as const;
const tfSourceFr = { ...tfSourceJa, label: "Documentation publique", note: "Il definit tf et la base du bag of words model." } as const;
const idfSourceFr = { ...idfSourceJa, label: "Documentation publique", note: "Il explique idf et pourquoi les rare term sont plus discriminants." } as const;
const tfIdfSourceFr = { ...tfIdfSourceJa, label: "Documentation publique", note: "Il explique la combinaison tf-idf et les conditions de poids eleve." } as const;
const vectorSpaceSourceFr = { ...vectorSpaceSourceJa, label: "Documentation publique", note: "Il presente l'idee de placer document et query dans le meme vector space." } as const;
const evaluationSourceFr = { ...evaluationSourceJa, label: "Documentation publique", note: "Il presente l'IR comme une discipline empirique et motive l'evaluation." } as const;
const unrankedEvaluationSourceFr = { ...unrankedEvaluationSourceJa, label: "Documentation publique", note: "Il definit Precision, Recall, F1 et explique pourquoi accuracy convient mal a l'IR." } as const;
const rankedEvaluationSourceFr = { ...rankedEvaluationSourceJa, label: "Documentation publique", note: "Il definit Precision at k, MAP et l'importance des premiers resultats." } as const;

export const irPrimerLocalizedContentByLocale: Partial<Record<SupportedArcadeLocale, IrPrimerLocalizedContent>> = {
  ja: {
    studyPages: [
      {
        key: "boolean-basics",
        title: "Boolean retrieval と inverted index",
        detail: "まず information retrieval の定義と、conjunctive Boolean search が inverted index をどう使うかを確認します。",
        body: [
          "## 1 章でつかむ検索の基本",
          "",
          "Stanford IR book は information retrieval を、大きな collection の中から情報要求を満たす資料、主に **unstructured text documents** を見つけることだと定義しています。",
          "",
          "最初に登場する retrieval model は **Boolean retrieval** で、document は query に一致するかしないかのどちらかです。",
          "",
          "### 中心となる data structure",
          "",
          "- 中心となるのは **inverted index** です。",
          "- dictionary は各 term を postings list に対応づけます。",
          "- postings list には、その term を含む document identifier が入ります。",
          "",
          "### Conjunctive query processing",
          "",
          "`Brutus AND Calpurnia` のような query では、system は各 postings list を取得して intersection を取ります。",
          "",
          "- merge walk は 2 本の sorted postings list 上で pointer を進めます。",
          "- intersection は list 長を $x$ と $y$ とすると $O(x + y)$ で進みます。",
          "- 複数 term の `AND` query では、中間結果を小さく保つため **increasing document frequency** の順に処理する heuristic が推奨されます。",
        ].join("\n"),
        sources: [booleanSourceJa, booleanProcessingSourceJa],
      },
      {
        key: "terms-postings",
        title: "Terms、Normalization、phrase support",
        detail: "text が indexed term に変わる流れと、stop words、phrase query の扱いを確認します。",
        body: [
          "## Document から term へ",
          "",
          "book は inverted index construction の主要 4 step を次のように整理しています。",
          "",
          "1. documents を集める",
          "2. text を tokenize する",
          "3. linguistic preprocessing を行う",
          "4. 各 term が現れる documents を index する",
          "",
          "### よく使う preprocessing",
          "",
          "- **Stop words** は非常に頻出する term で、system によっては vocabulary から外します。",
          "- ただし book は、stop list が space を節約しても、`\"President of the United States\"` のような phrase query の意味を壊しうると指摘します。",
          "- **Normalization** は punctuation や hyphenation の違いのような表面差を吸収する処理です。",
          "- **Stemming** は suffix を切り落とす heuristic で、**lemmatization** は vocabulary と morphology を使って dictionary form を返します。",
          "",
          "### Phrase queries",
          "",
          "document membership だけの postings list では phrase query を十分に扱えません。",
          "",
          "- 多くの search engine は double quotes 付きの phrase query をサポートします。",
          "- positional index は term position を持つので、term が正しい順序で隣接しているかを検証できます。",
          "- biword index もありますが、一般形としては positional index が主役です。",
        ].join("\n"),
        sources: [vocabularySourceJa, stopWordsSourceJa, normalizationSourceJa, stemmingSourceJa, phraseSourceJa],
      },
      {
        key: "tolerant-retrieval",
        title: "Wildcard queries と spelling correction",
        detail: "tolerant retrieval が query の曖昧さや typo をどう扱うかを確認します。",
        body: [
          "## Exact match だけでは足りないとき",
          "",
          "tolerant retrieval の章では、spelling variation、typo、partial knowledge のために query が曖昧になる場合を扱います。",
          "",
          "### Wildcard retrieval",
          "",
          "- `automat*` のような wildcard query は pattern を共有する term variant を探します。",
          "- **permuterm index** は各 term に `$` を付けて全 rotation を保存し、wildcard query を回転させて prefix lookup にします。",
          "- **k-gram index** は各 k-gram を、それを含む vocabulary term に対応づけます。",
          "- k-gram index を wildcard query に使うと false positive が出るので、元の pattern に対する **post-filtering step** が必要です。",
          "",
          "### Spelling correction",
          "",
          "- **Edit distance** は 1 つの string を別の string に変えるための insert、delete、substitute の最小回数です。",
          "- vocabulary 全体に対して edit distance を総当たりするのは高コストです。",
          "- そのため book は、まず k-gram index で候補を出し、その小さな候補集合に対してだけ edit distance を計算します。",
        ].join("\n"),
        sources: [tolerantSourceJa, wildcardSourceJa, permutermSourceJa, wildcardKGramSourceJa, spellingSourceJa, editDistanceSourceJa, spellingKGramSourceJa],
      },
      {
        key: "index-construction",
        title: "BSBI と SPIMI",
        detail: "大規模 collection で必要になる、secondary storage 前提の block-oriented indexing algorithm を確認します。",
        body: [
          "## Scale が変わると index construction も変わる",
          "",
          "book は indexing を hardware 制約付きの問題として扱います。intermediate data 全体を memory で sort できないことが多いからです。",
          "",
          "### Blocked sort-based indexing (BSBI)",
          "",
          "- BSBI は collection を fixed-size block に分割します。",
          "- 各 block では **termID-docID** pair を集めて memory 内で sort し、postings list へ反転して disk に書きます。",
          "- 最後に intermediate block index を merge します。",
          "- 主な計算量は sorting が支配するため $\Theta(T \log T)$ です。",
          "",
          "### Single-pass in-memory indexing (SPIMI)",
          "",
          "- SPIMI は block 内で **term そのもの** を使います。",
          "- すべての pair を sort する代わりに、dynamic postings list へ直接 append します。",
          "- block dictionary は disk に書く前に sort されるので、後段の merge は保ちやすいです。",
          "- token sorting を避けるため、book は SPIMI を $\Theta(T)$ と説明します。",
        ].join("\n"),
        sources: [indexingSourceJa, bsbiSourceJa, spimiSourceJa],
      },
      {
        key: "ranking",
        title: "tf、idf、vector space scoring",
        detail: "単に match するかではなく、document を query への有用さで並べる段階です。",
        body: [
          "## Match から ranking へ",
          "",
          "ranking の章では、大きな collection では一致 document が多すぎるため、search engine は score を付けて順位づけしなければならないと説明します。",
          "",
          "### Term weighting",
          "",
          "- **Term frequency** $tf_{t,d}$ は、term $t$ が document $d$ に現れる回数です。",
          "- **bag of words** model は term count を保持しますが、正確な語順は捨てます。",
          "- **Document frequency** `df_t` は、その term を含む document 数です。",
          "- **Inverse document frequency** は $idf_t = \\log(N / df_t)$ で、rare term ほど高くなります。",
          "",
          "### tf-idf と vector",
          "",
          "- book は $tf\\text{-}idf_{t,d} = tf_{t,d} \\cdot idf_t$ と定義します。",
          "- 少数の document にだけ多く現れる term ほど高い重みを持ちます。",
          "- document と query は共通の vector space 上の vector とみなせます。",
          "- vector space scoring は、その weighted vector を比較して順位づけします。",
        ].join("\n"),
        sources: [scoringSourceJa, tfSourceJa, idfSourceJa, tfIdfSourceJa, vectorSpaceSourceJa],
      },
      {
        key: "evaluation",
        title: "Precision、Recall、ranked evaluation",
        detail: "IR は empirical に評価されるため、metric も indexing や ranking と同じくらい重要です。",
        body: [
          "## Evaluation も IR の一部",
          "",
          "evaluation の章では、IR は highly empirical な分野であり、stop list、stemming、idf weighting などの設計判断は representative な evaluation で確かめる必要があると述べます。",
          "",
          "### Unranked result sets",
          "",
          "- **Precision** は retrieved document のうち relevant なものの割合です。",
          "- **Recall** は relevant document のうち retrieved されたものの割合です。",
          "- **F1** は Precision と Recall の調和平均です。",
          "- book は、collection では nonrelevant document が圧倒的に多いので **accuracy** は IR 指標として不向きだと説明します。",
          "",
          "### Ranked result sets",
          "",
          "- ranked evaluation では top `k` のような prefix を見ます。",
          "- **Precision at k** は最初の数件の結果に注目します。",
          "- **MAP** は relevant document が現れるたびの precision を平均し、その後 query 間でも平均します。",
          "- book は、MAP が recall 全体をまたぐ安定した単一指標になるため広く使われると説明します。",
        ].join("\n"),
        sources: [evaluationSourceJa, unrankedEvaluationSourceJa, rankedEvaluationSourceJa],
      },
    ],
    questions: [
      { key: "q1", prompt: "## book は information retrieval を高いレベルでどう定義していますか。", selectionMode: "single", sources: [booleanSourceJa], explanation: "この章では、IR を大きな collection から情報要求を満たす unstructured material を見つけることとして定義しています。", choices: [
        { key: "a", label: "A", content: "大きな collection から情報要求を満たす unstructured material を見つけること", isCorrect: true },
        { key: "b", label: "B", content: "structured database row に対する SQL update を実行すること", isCorrect: false },
        { key: "c", label: "C", content: "すべての document を hash table に圧縮すること", isCorrect: false },
        { key: "d", label: "D", content: "language model を一から学習すること", isCorrect: false },
      ] },
      { key: "q2", prompt: "## Boolean retrieval の中心 data structure はどれですか。", selectionMode: "single", sources: [booleanSourceJa], explanation: "Boolean retrieval の章では inverted index を中心 data structure として導入しています。", choices: [
        { key: "a", label: "A", content: "Inverted index", isCorrect: true },
        { key: "b", label: "B", content: "Suffix automaton", isCorrect: false },
        { key: "c", label: "C", content: "ROC table", isCorrect: false },
        { key: "d", label: "D", content: "Confusion matrix", isCorrect: false },
      ] },
      { key: "q3", prompt: "## 複数 term を持つ conjunctive `AND` query の処理で、book が推奨する heuristic はどれですか。", selectionMode: "single", sources: [booleanProcessingSourceJa], explanation: "中間結果を小さく保つため、document frequency が小さい term から処理する heuristic が推奨されています。", choices: [
        { key: "a", label: "A", content: "document frequency が小さい順に term を処理する", isCorrect: true },
        { key: "b", label: "B", content: "最も長い postings list から必ず処理する", isCorrect: false },
        { key: "c", label: "C", content: "intersection 前に常に synonym expansion を行う", isCorrect: false },
        { key: "d", label: "D", content: "すべての `AND` を phrase query に変換する", isCorrect: false },
      ] },
      { key: "q4", prompt: "## major inverted-index construction pipeline に含まれる step をすべて選んでください。", selectionMode: "multiple", sources: [vocabularySourceJa], explanation: "book は、documents の収集、tokenization、linguistic preprocessing、term occurrence の indexing を主要 step として挙げています。", choices: [
        { key: "a", label: "A", content: "index 対象の documents を集める", isCorrect: true },
        { key: "b", label: "B", content: "text を tokenize する", isCorrect: true },
        { key: "c", label: "C", content: "token に linguistic preprocessing を行う", isCorrect: true },
        { key: "d", label: "D", content: "各 term が現れる documents を index する", isCorrect: true },
      ] },
      { key: "q5", prompt: "## stop words について、book の説明として正しいものはどれですか。", selectionMode: "single", sources: [stopWordsSourceJa], explanation: "stop list は space を節約できますが、phrase query の意味を壊す場合があると説明しています。", choices: [
        { key: "a", label: "A", content: "stop list は postings space を節約できるが、phrase query を壊すことがある。", isCorrect: true },
        { key: "b", label: "B", content: "stop words は必ず 2 回 index しなければならない。", isCorrect: false },
        { key: "c", label: "C", content: "現代の web search は常に 300 語の stop list を使う。", isCorrect: false },
        { key: "d", label: "D", content: "stop words は image retrieval にしか関係しない。", isCorrect: false },
      ] },
      { key: "q6", prompt: "## stemming と lemmatization の対比として正しいものはどれですか。", selectionMode: "single", sources: [stemmingSourceJa], explanation: "stemming は heuristic な suffix chopping であり、lemmatization は morphology を使って dictionary form を返します。", choices: [
        { key: "a", label: "A", content: "stemming は heuristic な suffix chopping で、lemmatization は morphological analysis で dictionary form を目指す。", isCorrect: true },
        { key: "b", label: "B", content: "stemming は positional index より豊かな context を保持する。", isCorrect: false },
        { key: "c", label: "C", content: "lemmatization は英語で常に precision と recall を同時に改善する。", isCorrect: false },
        { key: "d", label: "D", content: "どちらもすべての postings list に phrase position を要求する。", isCorrect: false },
      ] },
      { key: "q7", prompt: "## document membership だけの postings list では phrase query に不十分なのはなぜですか。", selectionMode: "single", sources: [phraseSourceJa], explanation: "phrase query では、term が近接して正しい順序で現れることを示す position 情報が必要です。", choices: [
        { key: "a", label: "A", content: "phrase query には document membership ではなく position 情報が必要だから", isCorrect: true },
        { key: "b", label: "B", content: "phrase query では collection frequency だけを使うから", isCorrect: false },
        { key: "c", label: "C", content: "phrase query は inverted index を使えないから", isCorrect: false },
        { key: "d", label: "D", content: "phrase query は ROC curve でしか評価できないから", isCorrect: false },
      ] },
      { key: "q8", prompt: "## wildcard search に対して permuterm index は何をしますか。", selectionMode: "single", sources: [permutermSourceJa], explanation: "permuterm index は term の rotation を保存し、wildcard query を prefix lookup へ回転させます。", choices: [
        { key: "a", label: "A", content: "各 augmented term の全 rotation を保存し、wildcard を prefix lookup に回転できるようにする。", isCorrect: true },
        { key: "b", label: "B", content: "すべての wildcard query を tf-idf weight に置き換える。", isCorrect: false },
        { key: "c", label: "C", content: "すべての postings list を逆順 rank で保存する。", isCorrect: false },
        { key: "d", label: "D", content: "標準的な inverted index を不要にする。", isCorrect: false },
      ] },
      { key: "q9", prompt: "## wildcard query 用の k-gram index について正しい記述をすべて選んでください。", selectionMode: "multiple", sources: [wildcardKGramSourceJa], explanation: "k-gram index は gram から vocabulary term へ引き、false positive を出しうるので元 pattern による post-filtering が必要です。", choices: [
        { key: "a", label: "A", content: "各 k-gram を、その k-gram を含む vocabulary term に対応づける。", isCorrect: true },
        { key: "b", label: "B", content: "元の wildcard query で filter し直す必要がある term を列挙することがある。", isCorrect: true },
        { key: "c", label: "C", content: "元の wildcard pattern に対する確認は不要になる。", isCorrect: false },
        { key: "d", label: "D", content: "ranking evaluation にだけ使われ、retrieval には使われない。", isCorrect: false },
      ] },
      { key: "q10", prompt: "## spelling-correction の章でいう edit distance とは何ですか。", selectionMode: "single", sources: [editDistanceSourceJa], explanation: "edit distance は、1 つの string を別の string に変えるための insert、delete、substitute の最小回数です。", choices: [
        { key: "a", label: "A", content: "1 つの string を別の string に変えるための insert、delete、substitute の最小回数", isCorrect: true },
        { key: "b", label: "B", content: "2 つの query term が共有する postings 数", isCorrect: false },
        { key: "c", label: "C", content: "stop list によって削除される document 数", isCorrect: false },
        { key: "d", label: "D", content: "document frequency の logarithm", isCorrect: false },
      ] },
      { key: "q11", prompt: "## book は spelling correction で k-gram index をどう使いますか。", selectionMode: "single", sources: [spellingSourceJa, spellingKGramSourceJa], explanation: "先に k-gram overlap で candidate を作り、その candidate にだけ edit distance を計算します。", choices: [
        { key: "a", label: "A", content: "k-gram overlap で candidate を作り、その candidate にだけ edit distance を計算する。", isCorrect: true },
        { key: "b", label: "B", content: "先に vocabulary 全体へ edit distance を計算し、後から k-gram を作る。", isCorrect: false },
        { key: "c", label: "C", content: "常に collection frequency が最も高い term へ置換する。", isCorrect: false },
        { key: "d", label: "D", content: "1 つでも matching k-gram があれば同じ plausibility とみなす。", isCorrect: false },
      ] },
      { key: "q12", prompt: "## BSBI に含まれる action をすべて選んでください。", selectionMode: "multiple", sources: [bsbiSourceJa], explanation: "BSBI は block 分割、termID-docID pair の sorting、intermediate index の disk 書き出し、最後の merge から成ります。", choices: [
        { key: "a", label: "A", content: "collection を block に分割する", isCorrect: true },
        { key: "b", label: "B", content: "各 block の termID-docID pair を memory 内で sort する", isCorrect: true },
        { key: "c", label: "C", content: "intermediate block index を disk に書く", isCorrect: true },
        { key: "d", label: "D", content: "block index を merge して final index にする", isCorrect: true },
      ] },
      { key: "q13", prompt: "## SPIMI を BSBI と区別する説明として正しいものはどれですか。", selectionMode: "single", sources: [spimiSourceJa], explanation: "SPIMI はすべての pair を先に sort せず、dynamic postings list に直接 append します。", choices: [
        { key: "a", label: "A", content: "SPIMI は termID-docID pair を全部 sort する代わりに dynamic postings list へ直接追加する。", isCorrect: true },
        { key: "b", label: "B", content: "SPIMI は index construction 前に collection を必ず 2 回読み直す。", isCorrect: false },
        { key: "c", label: "C", content: "SPIMI は block を disk に書かない。", isCorrect: false },
        { key: "d", label: "D", content: "SPIMI は phrase index 専用である。", isCorrect: false },
      ] },
      { key: "q14", prompt: "## book に一致する complexity pairing はどれですか。", selectionMode: "single", sources: [bsbiSourceJa, spimiSourceJa], explanation: "book は BSBI の支配項を $\\Theta(T \\log T)$、SPIMI を $\\Theta(T)$ と説明しています。", choices: [
        { key: "a", label: "A", content: "BSBI: $\\Theta(T \\log T)$ and SPIMI: $\\Theta(T)$", isCorrect: true },
        { key: "b", label: "B", content: "BSBI: $\\Theta(T)$ and SPIMI: $\\Theta(T \\log T)$", isCorrect: false },
        { key: "c", label: "C", content: "Both are $\\Theta(\\log T)$", isCorrect: false },
        { key: "d", label: "D", content: "Both are quadratic in the collection size", isCorrect: false },
      ] },
      { key: "q15", prompt: "## tf、idf、tf-idf について正しい記述をすべて選んでください。", selectionMode: "multiple", sources: [tfSourceJa, idfSourceJa, tfIdfSourceJa], explanation: "tf は document 内の出現回数、idf は $\\log(N / df_t)$、tf-idf はその積です。", choices: [
        { key: "a", label: "A", content: "$tf_{t,d}$ is the number of occurrences of term $t$ in document $d$.", isCorrect: true },
        { key: "b", label: "B", content: "$idf_t = \\log(N / df_t)$.", isCorrect: true },
        { key: "c", label: "C", content: "$tf\\text{-}idf_{t,d} = tf_{t,d} \\cdot idf_t$.", isCorrect: true },
        { key: "d", label: "D", content: "ほぼすべての document に現れる term が最も高い idf を持つ。", isCorrect: false },
      ] },
      { key: "q16", prompt: "## book の ranking model では、どんなとき term が特に高い tf-idf weight を持ちますか。", selectionMode: "single", sources: [tfIdfSourceJa], explanation: "少数の document にだけ多く現れる term が最も高い tf-idf を持ちます。", choices: [
        { key: "a", label: "A", content: "少数の document にだけ何度も現れるとき", isCorrect: true },
        { key: "b", label: "B", content: "ほぼすべての document に現れる stop word であるとき", isCorrect: false },
        { key: "c", label: "C", content: "query に一度も現れないとき", isCorrect: false },
        { key: "d", label: "D", content: "metadata zone にしか現れないとき", isCorrect: false },
      ] },
      { key: "q17", prompt: "## unranked evaluation について正しい記述はどれですか。", selectionMode: "single", sources: [unrankedEvaluationSourceJa], explanation: "Precision は retrieved document のうち relevant なものの割合です。", choices: [
        { key: "a", label: "A", content: "Precision は retrieved document のうち relevant なものの割合である。", isCorrect: true },
        { key: "b", label: "B", content: "Recall は retrieved document のうち nonrelevant なものの割合である。", isCorrect: false },
        { key: "c", label: "C", content: "nonrelevant document が少ないので accuracy が IR の第一指標である。", isCorrect: false },
        { key: "d", label: "D", content: "F1 は Precision と Recall の算術平均である。", isCorrect: false },
      ] },
      { key: "q18", prompt: "## ranked evaluation について正しい記述をすべて選んでください。", selectionMode: "multiple", sources: [rankedEvaluationSourceJa], explanation: "ranked evaluation の章では、Precision at k と MAP を early results と query 平均の両面から説明しています。", choices: [
        { key: "a", label: "A", content: "Precision at `k` は上位 `k` 件の ranked result を評価する。", isCorrect: true },
        { key: "b", label: "B", content: "MAP は relevant document が現れる位置ごとの precision を平均し、その後 query 間でも平均する。", isCorrect: true },
        { key: "c", label: "C", content: "MAP は ranked order を無視し、unordered set だけを扱う。", isCorrect: false },
        { key: "d", label: "D", content: "Precision at `k` は web search のように最初の結果が重要な場面向けに設計されている。", isCorrect: true },
      ] },
    ],
  },
  zh: {
    studyPages: [
      {
        key: "boolean-basics",
        title: "Boolean retrieval 与 inverted index",
        detail: "先理解 information retrieval 的定义，再看 conjunctive Boolean search 如何使用 inverted index。",
        body: [
          "## 用一页理解搜索基础",
          "",
          "Stanford IR book 把 information retrieval 定义为：从大型 collection 中找到能满足信息需求的资料，通常是 **unstructured text documents**。",
          "",
          "书中首先介绍的 retrieval model 是 **Boolean retrieval**，也就是 document 要么匹配 query，要么不匹配。",
          "",
          "### 核心 data structure",
          "",
          "- 核心结构是 **inverted index**。",
          "- dictionary 把每个 term 映射到 postings list。",
          "- postings list 存放包含该 term 的 document identifier。",
          "",
          "### Conjunctive query processing",
          "",
          "像 `Brutus AND Calpurnia` 这样的 query，会先取出各自的 postings list，再做 intersection。",
          "",
          "- merge walk 会在两条 sorted postings list 上推进 pointer。",
          "- 当 list 长度为 $x$ 和 $y$ 时，intersection 的时间是 $O(x + y)$。",
          "- 对于多 term 的 `AND` query，推荐按 **increasing document frequency** 的顺序处理，以保持较小的中间结果。",
        ].join("\n"),
        sources: [booleanSourceZh, booleanProcessingSourceZh],
      },
      {
        key: "terms-postings",
        title: "Terms、Normalization 与 phrase support",
        detail: "这一节说明 text 如何变成 indexed term，以及 stop words 和 phrase query 的取舍。",
        body: [
          "## 从 document 到 term",
          "",
          "书中把 inverted index construction 的主要 4 个 step 总结为：",
          "",
          "1. 收集 documents",
          "2. tokenize text",
          "3. 做 linguistic preprocessing",
          "4. index 每个 term 出现在哪些 documents 中",
          "",
          "### 常见 preprocessing 选择",
          "",
          "- **Stop words** 是极其常见的 term，有些 system 会把它们从 vocabulary 中去掉。",
          "- 但书里指出，stop list 虽然能省 space，却可能破坏 `\"President of the United States\"` 这种 phrase query 的含义。",
          "- **Normalization** 用来吸收 punctuation、hyphenation 等表面差异。",
          "- **Stemming** 是 heuristic 的 suffix chopping，**lemmatization** 则利用 vocabulary 与 morphology 返回 dictionary form。",
          "",
          "### Phrase queries",
          "",
          "只有 document membership 的 postings list 不足以支持 phrase query。",
          "",
          "- 很多 search engine 支持带 double quotes 的 phrase query。",
          "- positional index 保存 term position，因此能验证 term 是否以正确顺序相邻出现。",
          "- biword index 也可用，但更通用的机制是 positional index。",
        ].join("\n"),
        sources: [vocabularySourceZh, stopWordsSourceZh, normalizationSourceZh, stemmingSourceZh, phraseSourceZh],
      },
      {
        key: "tolerant-retrieval",
        title: "Wildcard queries 与 spelling correction",
        detail: "这一节关注 query 不确定、拼写变化和 typo 时的检索处理。",
        body: [
          "## 当 exact match 过于严格时",
          "",
          "tolerant retrieval 讨论的是：当 query 因 spelling variation、typo 或 partial knowledge 而不够精确时，系统如何仍然工作。",
          "",
          "### Wildcard retrieval",
          "",
          "- 像 `automat*` 这样的 wildcard query 会查找共享同一 pattern 的 term variant。",
          "- **permuterm index** 会给每个 term 加上 `$` 并保存所有 rotation，再把 wildcard query 旋转成 prefix lookup。",
          "- **k-gram index** 会把每个 k-gram 映射到包含它的 vocabulary term。",
          "- 用 k-gram index 做 wildcard query 时会出现 false positive，因此还需要 **post-filtering step**。",
          "",
          "### Spelling correction",
          "",
          "- **Edit distance** 是把一个 string 变成另一个 string 所需 insert、delete、substitute 的最少次数。",
          "- 对整个 vocabulary 暴力计算 edit distance 的成本太高。",
          "- 因此书里先用 k-gram index 找候选，再只对候选集合计算 edit distance。",
        ].join("\n"),
        sources: [tolerantSourceZh, wildcardSourceZh, permutermSourceZh, wildcardKGramSourceZh, spellingSourceZh, editDistanceSourceZh, spellingKGramSourceZh],
      },
      {
        key: "index-construction",
        title: "BSBI 与 SPIMI",
        detail: "面对大型 collection，需要理解适配 secondary storage 的 block-oriented indexing algorithm。",
        body: [
          "## 规模一大，index construction 就会变化",
          "",
          "书中把 indexing 看成受 hardware 限制的问题，因为中间数据往往无法全部在 memory 中完成 sort。",
          "",
          "### Blocked sort-based indexing (BSBI)",
          "",
          "- BSBI 会把 collection 切成 fixed-size block。",
          "- 每个 block 收集 **termID-docID** pair，在 memory 中 sort，转成 postings list，然后把 block index 写到 disk。",
          "- 最后再 merge 所有 intermediate block index。",
          "- 主要复杂度由 sorting 主导，因此是 $\\Theta(T \\log T)$。",
          "",
          "### Single-pass in-memory indexing (SPIMI)",
          "",
          "- SPIMI 在 block 内直接使用 **term** 而不是 termID。",
          "- 它不是先收集所有 pair 再 sort，而是直接 append 到 dynamic postings list。",
          "- block dictionary 在写盘前仍会 sort，以便后续 merge。",
          "- 因为避免了 token sorting，书里把 SPIMI 记为 $\\Theta(T)$。",
        ].join("\n"),
        sources: [indexingSourceZh, bsbiSourceZh, spimiSourceZh],
      },
      {
        key: "ranking",
        title: "tf、idf 与 vector space scoring",
        detail: "这一节关注的不再只是是否 match，而是 document 对 query 有多大帮助。",
        body: [
          "## 从 match 走向 ranking",
          "",
          "ranking 章节说明，大型 collection 往往会返回太多匹配结果，因此 search engine 必须为结果打分并排序。",
          "",
          "### Term weighting",
          "",
          "- **Term frequency** $tf_{t,d}$ 是 term $t$ 在 document $d$ 中出现的次数。",
          "- **bag of words** model 保留 term count，但忽略精确词序。",
          "- **Document frequency** `df_t` 是包含该 term 的 document 数量。",
          "- **Inverse document frequency** 为 $idf_t = \\log(N / df_t)$，因此 rare term 的 idf 更高。",
          "",
          "### tf-idf 与 vector",
          "",
          "- 书中定义 $tf\\text{-}idf_{t,d} = tf_{t,d} \\cdot idf_t$。",
          "- 一个 term 如果在少数 documents 中出现很多次，就会得到更高的权重。",
          "- document 和 query 都可以看成同一 vector space 中的 vector。",
          "- vector space scoring 会比较这些 weighted vector 来完成 ranking。",
        ].join("\n"),
        sources: [scoringSourceZh, tfSourceZh, idfSourceZh, tfIdfSourceZh, vectorSpaceSourceZh],
      },
      {
        key: "evaluation",
        title: "Precision、Recall 与 ranked evaluation",
        detail: "IR 依赖 empirical evaluation，因此 metric 与 indexing、ranking 同样关键。",
        body: [
          "## Evaluation 也是 IR 的一部分",
          "",
          "evaluation 章节指出，IR 是一个 highly empirical 的领域，stop list、stemming、idf weighting 等设计都需要 representative evaluation。",
          "",
          "### Unranked result sets",
          "",
          "- **Precision** 是 retrieved documents 中 relevant 的比例。",
          "- **Recall** 是所有 relevant documents 中被 retrieved 的比例。",
          "- **F1** 是 Precision 与 Recall 的调和平均。",
          "- 书中认为 **accuracy** 不适合作为 IR metric，因为 nonrelevant document 太多。",
          "",
          "### Ranked result sets",
          "",
          "- ranked evaluation 会看 top `k` 这样的结果前缀。",
          "- **Precision at k** 关注最前面的几条结果。",
          "- **MAP** 会先平均每次命中 relevant document 时的 precision，再在 queries 之间平均。",
          "- 书中指出，MAP 因为能对整个 recall 范围给出稳定单值总结，所以被广泛使用。",
        ].join("\n"),
        sources: [evaluationSourceZh, unrankedEvaluationSourceZh, rankedEvaluationSourceZh],
      },
    ],
    questions: [
      { key: "q1", prompt: "## 这本书从高层上如何定义 information retrieval？", selectionMode: "single", sources: [booleanSourceZh], explanation: "本章把 IR 定义为：从大型 collection 中找到满足信息需求的 unstructured material。", choices: [
        { key: "a", label: "A", content: "从大型 collection 中找到满足信息需求的 unstructured material", isCorrect: true },
        { key: "b", label: "B", content: "对 structured database row 执行 SQL update", isCorrect: false },
        { key: "c", label: "C", content: "把所有 document 压缩成 hash table", isCorrect: false },
        { key: "d", label: "D", content: "从零开始训练 language model", isCorrect: false },
      ] },
      { key: "q2", prompt: "## Boolean retrieval 的核心 data structure 是什么？", selectionMode: "single", sources: [booleanSourceZh], explanation: "Boolean retrieval 章节把 inverted index 作为核心 data structure 介绍。", choices: [
        { key: "a", label: "A", content: "Inverted index", isCorrect: true },
        { key: "b", label: "B", content: "Suffix automaton", isCorrect: false },
        { key: "c", label: "C", content: "ROC table", isCorrect: false },
        { key: "d", label: "D", content: "Confusion matrix", isCorrect: false },
      ] },
      { key: "q3", prompt: "## 对含多个 term 的 conjunctive `AND` query，书中推荐的 heuristic 是什么？", selectionMode: "single", sources: [booleanProcessingSourceZh], explanation: "为了保持中间结果较小，推荐先处理 document frequency 较小的 term。", choices: [
        { key: "a", label: "A", content: "按 document frequency 从小到大处理 term", isCorrect: true },
        { key: "b", label: "B", content: "永远先处理最长的 postings list", isCorrect: false },
        { key: "c", label: "C", content: "先对所有 term 做 synonym expansion 再 intersection", isCorrect: false },
        { key: "d", label: "D", content: "把所有 `AND` 都改写成 phrase query", isCorrect: false },
      ] },
      { key: "q4", prompt: "## 下列哪些 step 属于 major inverted-index construction pipeline？请选择所有正确项。", selectionMode: "multiple", sources: [vocabularySourceZh], explanation: "书中列出的主要 step 是收集 documents、tokenization、linguistic preprocessing 和 index term occurrence。", choices: [
        { key: "a", label: "A", content: "收集要被 index 的 documents", isCorrect: true },
        { key: "b", label: "B", content: "对 text 做 tokenize", isCorrect: true },
        { key: "c", label: "C", content: "对 token 做 linguistic preprocessing", isCorrect: true },
        { key: "d", label: "D", content: "index 每个 term 出现于哪些 documents", isCorrect: true },
      ] },
      { key: "q5", prompt: "## 关于 stop words，书中的哪种说法是正确的？", selectionMode: "single", sources: [stopWordsSourceZh], explanation: "stop list 可以节省 space，但也可能损害 phrase query 的含义。", choices: [
        { key: "a", label: "A", content: "stop list 可以节省 postings space，但可能损害 phrase query。", isCorrect: true },
        { key: "b", label: "B", content: "stop words 必须始终被 index 两次。", isCorrect: false },
        { key: "c", label: "C", content: "现代 web search 默认总是依赖 300 个 stop words。", isCorrect: false },
        { key: "d", label: "D", content: "stop words 只和 image retrieval 有关。", isCorrect: false },
      ] },
      { key: "q6", prompt: "## 下列哪项正确对比了 stemming 与 lemmatization？", selectionMode: "single", sources: [stemmingSourceZh], explanation: "stemming 是 heuristic 的 suffix chopping，而 lemmatization 会结合 morphology 返回 dictionary form。", choices: [
        { key: "a", label: "A", content: "stemming 是 heuristic 的 suffix chopping，而 lemmatization 通过 morphological analysis 追求 dictionary form。", isCorrect: true },
        { key: "b", label: "B", content: "stemming 比 positional index 保留更多上下文。", isCorrect: false },
        { key: "c", label: "C", content: "lemmatization 在英语中总能同时提高 precision 和 recall。", isCorrect: false },
        { key: "d", label: "D", content: "两者都要求每条 postings list 记录 phrase position。", isCorrect: false },
      ] },
      { key: "q7", prompt: "## 为什么只有 document membership 的 postings list 不足以处理 phrase query？", selectionMode: "single", sources: [phraseSourceZh], explanation: "因为 phrase query 需要知道 term 的位置与顺序，而不仅仅是 document membership。", choices: [
        { key: "a", label: "A", content: "因为 phrase query 需要位置与顺序信息，而不仅仅是 document membership", isCorrect: true },
        { key: "b", label: "B", content: "因为 phrase query 只需要 collection frequency", isCorrect: false },
        { key: "c", label: "C", content: "因为 phrase query 无法使用 inverted index", isCorrect: false },
        { key: "d", label: "D", content: "因为 phrase query 只能用 ROC curve 评估", isCorrect: false },
      ] },
      { key: "q8", prompt: "## 对于 wildcard search，permuterm index 做了什么？", selectionMode: "single", sources: [permutermSourceZh], explanation: "permuterm index 会保存 augmented term 的全部 rotation，使 wildcard query 能转换成 prefix lookup。", choices: [
        { key: "a", label: "A", content: "保存每个 augmented term 的全部 rotation，使 wildcard 能转成 prefix lookup。", isCorrect: true },
        { key: "b", label: "B", content: "把所有 wildcard query 替换成 tf-idf weight。", isCorrect: false },
        { key: "c", label: "C", content: "把所有 postings list 按逆序 rank 保存。", isCorrect: false },
        { key: "d", label: "D", content: "让标准 inverted index 不再需要。", isCorrect: false },
      ] },
      { key: "q9", prompt: "## 关于用于 wildcard query 的 k-gram index，下列哪些说法是正确的？请选择所有正确项。", selectionMode: "multiple", sources: [wildcardKGramSourceZh], explanation: "k-gram index 从 gram 指向 vocabulary term，且可能枚举出 false positive，因此需要 post-filtering。", choices: [
        { key: "a", label: "A", content: "它把每个 k-gram 映射到包含该 k-gram 的 vocabulary term。", isCorrect: true },
        { key: "b", label: "B", content: "它可能枚举出还需要用原 wildcard query 再过滤的 term。", isCorrect: true },
        { key: "c", label: "C", content: "它消除了检查原 wildcard pattern 的需要。", isCorrect: false },
        { key: "d", label: "D", content: "它只用于 ranked evaluation，而不是 retrieval。", isCorrect: false },
      ] },
      { key: "q10", prompt: "## 在 spelling-correction 章节里，edit distance 指什么？", selectionMode: "single", sources: [editDistanceSourceZh], explanation: "edit distance 是把一个 string 变成另一个 string 所需的最少 insert、delete、substitute 次数。", choices: [
        { key: "a", label: "A", content: "把一个 string 变成另一个 string 所需的最少 insert、delete、substitute 次数", isCorrect: true },
        { key: "b", label: "B", content: "两个 query term 共享的 postings 数量", isCorrect: false },
        { key: "c", label: "C", content: "stop list 去掉的 document 数量", isCorrect: false },
        { key: "d", label: "D", content: "document frequency 的对数", isCorrect: false },
      ] },
      { key: "q11", prompt: "## 书中如何将 k-gram index 用于 spelling correction？", selectionMode: "single", sources: [spellingSourceZh, spellingKGramSourceZh], explanation: "先通过 k-gram overlap 生成 candidate，再只对这些 candidate 计算 edit distance。", choices: [
        { key: "a", label: "A", content: "先用 k-gram overlap 生成 candidate，再对 candidate 计算 edit distance。", isCorrect: true },
        { key: "b", label: "B", content: "先对整个 vocabulary 做 edit distance，再补建 k-gram。", isCorrect: false },
        { key: "c", label: "C", content: "直接替换成 collection frequency 最高的 term。", isCorrect: false },
        { key: "d", label: "D", content: "只要有一个匹配 k-gram，就认为候选同样合理。", isCorrect: false },
      ] },
      { key: "q12", prompt: "## 下列哪些 action 属于 BSBI？请选择所有正确项。", selectionMode: "multiple", sources: [bsbiSourceZh], explanation: "BSBI 包括 block 切分、termID-docID pair 排序、写出 intermediate index，以及最终 merge。", choices: [
        { key: "a", label: "A", content: "把 collection 分成 block", isCorrect: true },
        { key: "b", label: "B", content: "在 memory 中对每个 block 的 termID-docID pair 排序", isCorrect: true },
        { key: "c", label: "C", content: "把 intermediate block index 写到 disk", isCorrect: true },
        { key: "d", label: "D", content: "把 block index merge 成 final index", isCorrect: true },
      ] },
      { key: "q13", prompt: "## 下列哪项能区分 SPIMI 与 BSBI？", selectionMode: "single", sources: [spimiSourceZh], explanation: "SPIMI 不是先收集全部 pair 再排序，而是直接向 dynamic postings list 追加。", choices: [
        { key: "a", label: "A", content: "SPIMI 会直接向 dynamic postings list 追加，而不是先排序所有 termID-docID pair。", isCorrect: true },
        { key: "b", label: "B", content: "SPIMI 要在开始 indexing 前完整扫描 collection 两遍。", isCorrect: false },
        { key: "c", label: "C", content: "SPIMI 不会把 block 写到 disk。", isCorrect: false },
        { key: "d", label: "D", content: "SPIMI 只为 phrase index 定义。", isCorrect: false },
      ] },
      { key: "q14", prompt: "## 哪组 complexity pairing 与书中一致？", selectionMode: "single", sources: [bsbiSourceZh, spimiSourceZh], explanation: "书中给出的复杂度是 BSBI 为 $\\Theta(T \\log T)$，SPIMI 为 $\\Theta(T)$。", choices: [
        { key: "a", label: "A", content: "BSBI: $\\Theta(T \\log T)$ and SPIMI: $\\Theta(T)$", isCorrect: true },
        { key: "b", label: "B", content: "BSBI: $\\Theta(T)$ and SPIMI: $\\Theta(T \\log T)$", isCorrect: false },
        { key: "c", label: "C", content: "Both are $\\Theta(\\log T)$", isCorrect: false },
        { key: "d", label: "D", content: "Both are quadratic in the collection size", isCorrect: false },
      ] },
      { key: "q15", prompt: "## 关于 tf、idf 和 tf-idf，下列哪些说法正确？请选择所有正确项。", selectionMode: "multiple", sources: [tfSourceZh, idfSourceZh, tfIdfSourceZh], explanation: "tf 统计 document 内出现次数，idf 使用 $\\log(N / df_t)$，tf-idf 则把两者相乘。", choices: [
        { key: "a", label: "A", content: "$tf_{t,d}$ is the number of occurrences of term $t$ in document $d$.", isCorrect: true },
        { key: "b", label: "B", content: "$idf_t = \\log(N / df_t)$.", isCorrect: true },
        { key: "c", label: "C", content: "$tf\\text{-}idf_{t,d} = tf_{t,d} \\cdot idf_t$.", isCorrect: true },
        { key: "d", label: "D", content: "出现在几乎所有 document 中的 term 应该拥有最高 idf。", isCorrect: false },
      ] },
      { key: "q16", prompt: "## 在书中的 ranking model 里，term 在什么情况下会获得特别高的 tf-idf weight？", selectionMode: "single", sources: [tfIdfSourceZh], explanation: "当一个 term 在少数 documents 中出现很多次时，它会得到特别高的 tf-idf。", choices: [
        { key: "a", label: "A", content: "当它在少数 documents 中出现很多次时", isCorrect: true },
        { key: "b", label: "B", content: "当它是出现在几乎所有 documents 中的 stop word 时", isCorrect: false },
        { key: "c", label: "C", content: "当它从未出现在 query 中时", isCorrect: false },
        { key: "d", label: "D", content: "当它只出现在 metadata zone 中时", isCorrect: false },
      ] },
      { key: "q17", prompt: "## 关于 unranked evaluation，哪种说法是正确的？", selectionMode: "single", sources: [unrankedEvaluationSourceZh], explanation: "Precision 是 retrieved 文档中 relevant 文档所占的比例。", choices: [
        { key: "a", label: "A", content: "Precision 是 retrieved document 中 relevant 的比例。", isCorrect: true },
        { key: "b", label: "B", content: "Recall 是 retrieved document 中 nonrelevant 的比例。", isCorrect: false },
        { key: "c", label: "C", content: "因为 nonrelevant document 很少，所以 accuracy 是 IR 的首要指标。", isCorrect: false },
        { key: "d", label: "D", content: "F1 是 Precision 和 Recall 的算术平均。", isCorrect: false },
      ] },
      { key: "q18", prompt: "## 关于 ranked evaluation，下列哪些说法正确？请选择所有正确项。", selectionMode: "multiple", sources: [rankedEvaluationSourceZh], explanation: "ranked evaluation 章节用 Precision at k 和 MAP 说明了前排结果与 query 间平均的重要性。", choices: [
        { key: "a", label: "A", content: "Precision at `k` 评估的是排名前 `k` 条结果。", isCorrect: true },
        { key: "b", label: "B", content: "MAP 会平均每次命中 relevant document 时的 precision，再在 queries 之间平均。", isCorrect: true },
        { key: "c", label: "C", content: "MAP 忽略 ranked order，只把 retrieval 当成 unordered set。", isCorrect: false },
        { key: "d", label: "D", content: "Precision at `k` 主要面向像 web search 这样重视前几条结果的场景。", isCorrect: true },
      ] },
    ],
  },
  fr: {
    studyPages: [
      {
        key: "boolean-basics",
        title: "Boolean retrieval et inverted index",
        detail: "Commencez par la definition de information retrieval, puis regardez comment une recherche Boolean conjonctive s'appuie sur un inverted index.",
        body: [
          "## La recherche en une page",
          "",
          "Le Stanford IR book definit information retrieval comme le fait de trouver, dans de grandes collections, un contenu repondant a un besoin d'information, le plus souvent des **unstructured text documents**.",
          "",
          "Le premier retrieval model presente est **Boolean retrieval** : un document correspond au query ou n'y correspond pas.",
          "",
          "### Data structure centrale",
          "",
          "- La structure centrale est l'**inverted index**.",
          "- Un dictionary associe chaque term a une postings list.",
          "- Une postings list contient les document identifier des documents ou apparait ce term.",
          "",
          "### Conjunctive query processing",
          "",
          "Pour `Brutus AND Calpurnia`, le systeme recupere chaque postings list puis calcule leur intersection.",
          "",
          "- Le merge walk avance des pointer sur deux sorted postings list.",
          "- L'intersection se fait en $O(x + y)$ pour des longueurs $x$ et $y$.",
          "- Pour un `AND` query a plusieurs term, l'heuristic recommandee consiste a traiter les term par **increasing document frequency** afin de garder de petits resultats intermediaires.",
        ].join("\n"),
        sources: [booleanSourceFr, booleanProcessingSourceFr],
      },
      {
        key: "terms-postings",
        title: "Terms, Normalization et support des phrase query",
        detail: "Cette section montre comment le text devient des indexed term et ce que changent stop words et phrase query.",
        body: [
          "## Des documents aux term",
          "",
          "Le livre organise le pipeline principal de construction d'un inverted index en quatre etapes :",
          "",
          "1. collecter les documents",
          "2. tokenize le texte",
          "3. effectuer le linguistic preprocessing",
          "4. indexer les documents dans lesquels chaque term apparait",
          "",
          "### Choix de preprocessing frequents",
          "",
          "- **Stop words** designe des term tres frequents que certains systemes retirent du vocabulary.",
          "- Le livre note qu'une stop list economise de l'espace, mais qu'elle peut casser le sens d'une phrase query comme `\"President of the United States\"`.",
          "- **Normalization** sert a absorber des differences superficielles comme la ponctuation ou la hyphenation.",
          "- **Stemming** est un heuristic de suppression de suffixe, alors que **lemmatization** vise la dictionary form a l'aide du vocabulary et de la morphology.",
          "",
          "### Phrase queries",
          "",
          "Une postings list qui ne dit que si un document contient un term ne suffit pas pour une phrase query.",
          "",
          "- Les search engine prennent souvent en charge les phrase query entre double quotes.",
          "- Un positional index conserve les positions des term pour verifier qu'ils apparaissent cote a cote dans le bon ordre.",
          "- Un biword index est possible, mais le positional index est le mecanisme general. ",
        ].join("\n"),
        sources: [vocabularySourceFr, stopWordsSourceFr, normalizationSourceFr, stemmingSourceFr, phraseSourceFr],
      },
      {
        key: "tolerant-retrieval",
        title: "Wildcard queries et spelling correction",
        detail: "Cette section traite de tolerant retrieval face a l'incertitude d'un query, a ses variantes et a ses fautes.",
        body: [
          "## Quand l'exact match est trop strict",
          "",
          "Le chapitre sur tolerant retrieval traite des query imprecis causes par des variantes d'ecriture, des typo ou une connaissance partielle.",
          "",
          "### Wildcard retrieval",
          "",
          "- Un wildcard query comme `automat*` cherche des variants de term partageant un meme pattern.",
          "- Un **permuterm index** ajoute `$` a chaque term, enregistre toutes les rotation puis transforme le wildcard query en prefix lookup.",
          "- Un **k-gram index** associe chaque k-gram aux vocabulary term qui le contiennent.",
          "- Avec un k-gram index, on obtient aussi des false positive, d'ou la necessite d'un **post-filtering step**. ",
          "",
          "### Spelling correction",
          "",
          "- **Edit distance** est le nombre minimal d'insert, delete et substitute pour transformer une string en une autre.",
          "- Calculer edit distance sur tout le vocabulary coute trop cher.",
          "- Le livre propose donc de generer d'abord des candidats avec un k-gram index, puis de calculer edit distance seulement sur eux.",
        ].join("\n"),
        sources: [tolerantSourceFr, wildcardSourceFr, permutermSourceFr, wildcardKGramSourceFr, spellingSourceFr, editDistanceSourceFr, spellingKGramSourceFr],
      },
      {
        key: "index-construction",
        title: "BSBI et SPIMI",
        detail: "Pour de grandes collections, il faut comprendre des algorithmes d'index construction par blocs adaptes au secondary storage.",
        body: [
          "## Quand l'echelle change, index construction change aussi",
          "",
          "Le livre presente l'indexing comme un probleme contraint par le materiel : tout trier en memory n'est souvent pas possible.",
          "",
          "### Blocked sort-based indexing (BSBI)",
          "",
          "- BSBI decoupe la collection en fixed-size block.",
          "- Chaque block accumule des pair **termID-docID**, les trie en memory, les inverse en postings list puis ecrit l'index du block sur disk.",
          "- Un merge final combine les block index intermediaires.",
          "- Son cout dominant est $\\Theta(T \\log T)$ car le sorting domine. ",
          "",
          "### Single-pass in-memory indexing (SPIMI)",
          "",
          "- SPIMI utilise directement des **term** plutot que des termID dans un block.",
          "- Il ajoute les postings a des dynamic postings list au lieu de trier d'abord tous les pair.",
          "- Le dictionary du block est trie avant l'ecriture sur disk, ce qui simplifie le merge suivant.",
          "- Le livre donne a SPIMI une complexite lineaire de $\\Theta(T)$. ",
        ].join("\n"),
        sources: [indexingSourceFr, bsbiSourceFr, spimiSourceFr],
      },
      {
        key: "ranking",
        title: "tf, idf et vector space scoring",
        detail: "Cette section ne regarde plus seulement le match, mais l'utilite d'un document pour le query.",
        body: [
          "## Du match vers le ranking",
          "",
          "Les chapitres sur le ranking expliquent que, dans de grandes collections, il y a trop de documents correspondants : un search engine doit donc scorer puis classer les resultats.",
          "",
          "### Term weighting",
          "",
          "- **Term frequency** $tf_{t,d}$ est le nombre d'occurrences du term $t$ dans le document $d$.",
          "- Le **bag of words** model conserve les compteurs de term mais ignore l'ordre exact des mots.",
          "- **Document frequency** `df_t` compte le nombre de documents contenant un term.",
          "- **Inverse document frequency** vaut $idf_t = \\log(N / df_t)$, ce qui donne plus de poids aux rare term. ",
          "",
          "### tf-idf et vecteurs",
          "",
          "- Le livre definit $tf\\text{-}idf_{t,d} = tf_{t,d} \\cdot idf_t$. ",
          "- Un term a le plus grand poids lorsqu'il apparait souvent dans un petit nombre de documents.",
          "- Les document et les query peuvent etre vus comme des vecteurs dans un meme vector space.",
          "- Le vector space scoring compare ensuite ces vecteurs ponderes pour etablir le classement.",
        ].join("\n"),
        sources: [scoringSourceFr, tfSourceFr, idfSourceFr, tfIdfSourceFr, vectorSpaceSourceFr],
      },
      {
        key: "evaluation",
        title: "Precision, Recall et ranked evaluation",
        detail: "L'IR repose sur une evaluation empirique, donc les metric comptent autant que l'indexing et le ranking.",
        body: [
          "## Evaluation fait partie de l'IR",
          "",
          "Le chapitre explique que information retrieval est une discipline hautement empirique : les choix de stop list, de stemming ou de idf weighting doivent etre verifies par evaluation.",
          "",
          "### Unranked result sets",
          "",
          "- **Precision** est la fraction de documents recuperes qui sont relevant.",
          "- **Recall** est la fraction des documents relevant qui sont recuperes.",
          "- **F1** est la moyenne harmonique de Precision et Recall.",
          "- Le livre explique que **accuracy** convient mal a l'IR car les documents non relevant dominent les collections.",
          "",
          "### Ranked result sets",
          "",
          "- Une ranked evaluation observe des prefixes comme les top `k` resultats.",
          "- **Precision at k** se concentre sur les premiers resultats. ",
          "- **MAP** moyenne les precision mesurees a chaque recuperation de document relevant, puis moyenne encore entre queries.",
          "- Le livre note que MAP est largement utilise car il donne un resume stable sur tout le rappel.",
        ].join("\n"),
        sources: [evaluationSourceFr, unrankedEvaluationSourceFr, rankedEvaluationSourceFr],
      },
    ],
    questions: [
      { key: "q1", prompt: "## Comment le livre definit-il information retrieval a haut niveau ?", selectionMode: "single", sources: [booleanSourceFr], explanation: "Le chapitre definit IR comme la recherche d'un unstructured material repondant a un besoin d'information dans de grandes collections.", choices: [
        { key: "a", label: "A", content: "Trouver un unstructured material qui satisfait un besoin d'information dans de grandes collections", isCorrect: true },
        { key: "b", label: "B", content: "Executer des SQL update sur des lignes structurees", isCorrect: false },
        { key: "c", label: "C", content: "Compresser chaque document dans une hash table", isCorrect: false },
        { key: "d", label: "D", content: "Entraîner un language model depuis zero", isCorrect: false },
      ] },
      { key: "q2", prompt: "## Quelle data structure est centrale pour Boolean retrieval ?", selectionMode: "single", sources: [booleanSourceFr], explanation: "Le chapitre introduit l'inverted index comme data structure centrale de Boolean retrieval.", choices: [
        { key: "a", label: "A", content: "Inverted index", isCorrect: true },
        { key: "b", label: "B", content: "Suffix automaton", isCorrect: false },
        { key: "c", label: "C", content: "ROC table", isCorrect: false },
        { key: "d", label: "D", content: "Confusion matrix", isCorrect: false },
      ] },
      { key: "q3", prompt: "## Quel heuristic le livre recommande-t-il pour traiter un conjunctive `AND` query avec plusieurs term ?", selectionMode: "single", sources: [booleanProcessingSourceFr], explanation: "Le livre recommande de traiter les term par ordre croissant de document frequency afin de garder de petits resultats intermediaires.", choices: [
        { key: "a", label: "A", content: "Traiter les term par ordre croissant de document frequency", isCorrect: true },
        { key: "b", label: "B", content: "Commencer par la postings list la plus longue", isCorrect: false },
        { key: "c", label: "C", content: "Toujours faire une synonym expansion avant l'intersection", isCorrect: false },
        { key: "d", label: "D", content: "Transformer chaque `AND` en phrase query", isCorrect: false },
      ] },
      { key: "q4", prompt: "## Quelles etapes font partie du major inverted-index construction pipeline ? Selectionnez toutes les bonnes reponses.", selectionMode: "multiple", sources: [vocabularySourceFr], explanation: "Le chapitre cite la collecte des documents, la tokenization, le linguistic preprocessing et l'indexation des occurrences comme etapes majeures.", choices: [
        { key: "a", label: "A", content: "Collecter les documents a indexer", isCorrect: true },
        { key: "b", label: "B", content: "Tokenize le texte", isCorrect: true },
        { key: "c", label: "C", content: "Faire le linguistic preprocessing des token", isCorrect: true },
        { key: "d", label: "D", content: "Indexer les documents dans lesquels chaque term apparait", isCorrect: true },
      ] },
      { key: "q5", prompt: "## Quelle affirmation sur stop words est correcte selon le livre ?", selectionMode: "single", sources: [stopWordsSourceFr], explanation: "Une stop list peut economiser de l'espace, mais elle peut aussi abimer le sens d'une phrase query.", choices: [
        { key: "a", label: "A", content: "Une stop list peut economiser de l'espace dans les postings, mais elle peut endommager une phrase query.", isCorrect: true },
        { key: "b", label: "B", content: "Les stop words doivent toujours etre indexes deux fois.", isCorrect: false },
        { key: "c", label: "C", content: "Le web search moderne depend toujours d'une stop list de 300 mots.", isCorrect: false },
        { key: "d", label: "D", content: "Les stop words concernent seulement l'image retrieval.", isCorrect: false },
      ] },
      { key: "q6", prompt: "## Quelle phrase oppose correctement stemming et lemmatization ?", selectionMode: "single", sources: [stemmingSourceFr], explanation: "stemming est un heuristic de suppression de suffixe, alors que lemmatization vise la dictionary form via la morphology.", choices: [
        { key: "a", label: "A", content: "stemming est une suppression heuristique de suffixe, alors que lemmatization vise la dictionary form via l'analyse morphologique.", isCorrect: true },
        { key: "b", label: "B", content: "stemming conserve plus de contexte qu'un positional index.", isCorrect: false },
        { key: "c", label: "C", content: "lemmatization augmente toujours precision et recall en anglais.", isCorrect: false },
        { key: "d", label: "D", content: "Les deux exigent des positions de phrase dans toutes les postings list.", isCorrect: false },
      ] },
      { key: "q7", prompt: "## Pourquoi de simples postings list limitees a l'appartenance au document ne suffisent-elles pas pour une phrase query ?", selectionMode: "single", sources: [phraseSourceFr], explanation: "Une phrase query a besoin d'information de position et d'ordre, pas seulement de l'appartenance au document.", choices: [
        { key: "a", label: "A", content: "Parce qu'une phrase query a besoin d'information de position, pas seulement d'appartenance au document", isCorrect: true },
        { key: "b", label: "B", content: "Parce qu'une phrase query n'utilise que la collection frequency", isCorrect: false },
        { key: "c", label: "C", content: "Parce qu'une phrase query ne peut pas utiliser un inverted index", isCorrect: false },
        { key: "d", label: "D", content: "Parce qu'une phrase query ne s'evalue qu'avec une ROC curve", isCorrect: false },
      ] },
      { key: "q8", prompt: "## Que fait un permuterm index pour le wildcard search ?", selectionMode: "single", sources: [permutermSourceFr], explanation: "Un permuterm index stocke toutes les rotation d'un term augmente et permet de transformer un wildcard query en prefix lookup.", choices: [
        { key: "a", label: "A", content: "Il stocke toutes les rotation de chaque augmented term pour transformer le wildcard en prefix lookup.", isCorrect: true },
        { key: "b", label: "B", content: "Il remplace tous les wildcard query par des tf-idf weight.", isCorrect: false },
        { key: "c", label: "C", content: "Il stocke chaque postings list dans l'ordre inverse du ranking.", isCorrect: false },
        { key: "d", label: "D", content: "Il supprime le besoin d'un inverted index classique.", isCorrect: false },
      ] },
      { key: "q9", prompt: "## Quelles affirmations sur un k-gram index pour les wildcard query sont correctes ? Selectionnez toutes les bonnes reponses.", selectionMode: "multiple", sources: [wildcardKGramSourceFr], explanation: "Un k-gram index associe les gram aux vocabulary term et peut produire des false positive qui exigent un post-filtering sur le pattern d'origine.", choices: [
        { key: "a", label: "A", content: "Il associe chaque k-gram aux vocabulary term qui contiennent ce k-gram.", isCorrect: true },
        { key: "b", label: "B", content: "Il peut enumerer des term qui doivent ensuite etre verifies contre le wildcard query d'origine.", isCorrect: true },
        { key: "c", label: "C", content: "Il supprime la necessite de verifier le pattern d'origine.", isCorrect: false },
        { key: "d", label: "D", content: "Il ne sert qu'a la ranked evaluation, pas a la retrieval.", isCorrect: false },
      ] },
      { key: "q10", prompt: "## Qu'est-ce que edit distance dans le chapitre sur spelling correction ?", selectionMode: "single", sources: [editDistanceSourceFr], explanation: "edit distance est le nombre minimal d'operations insert, delete et substitute necessaires pour transformer une string en une autre.", choices: [
        { key: "a", label: "A", content: "Le nombre minimal d'operations insert, delete et substitute necessaires pour transformer une string en une autre", isCorrect: true },
        { key: "b", label: "B", content: "Le nombre de postings partagees par deux query term", isCorrect: false },
        { key: "c", label: "C", content: "Le nombre de documents retires par une stop list", isCorrect: false },
        { key: "d", label: "D", content: "Le logarithme de la document frequency", isCorrect: false },
      ] },
      { key: "q11", prompt: "## Comment le livre utilise-t-il un k-gram index pour spelling correction ?", selectionMode: "single", sources: [spellingSourceFr, spellingKGramSourceFr], explanation: "Le livre genere d'abord des candidats par k-gram overlap, puis calcule edit distance seulement sur ces candidats.", choices: [
        { key: "a", label: "A", content: "Utiliser le k-gram overlap pour generer des candidats, puis calculer edit distance sur ces candidats.", isCorrect: true },
        { key: "b", label: "B", content: "Calculer edit distance sur tout le vocabulary avant de construire les k-gram.", isCorrect: false },
        { key: "c", label: "C", content: "Remplacer directement chaque query term par le term de plus forte collection frequency.", isCorrect: false },
        { key: "d", label: "D", content: "Considerer tout candidat avec un seul k-gram commun comme egalement plausible.", isCorrect: false },
      ] },
      { key: "q12", prompt: "## Quelles actions appartiennent a BSBI ? Selectionnez toutes les bonnes reponses.", selectionMode: "multiple", sources: [bsbiSourceFr], explanation: "BSBI segmente en block, trie les pair termID-docID en memory, ecrit des index intermediaires sur disk puis les fusionne.", choices: [
        { key: "a", label: "A", content: "Segmenter la collection en block", isCorrect: true },
        { key: "b", label: "B", content: "Trier en memory les pair termID-docID de chaque block", isCorrect: true },
        { key: "c", label: "C", content: "Ecrire les index intermediaires de block sur disk", isCorrect: true },
        { key: "d", label: "D", content: "Fusionner les block index en un final index", isCorrect: true },
      ] },
      { key: "q13", prompt: "## Quelle affirmation distingue SPIMI de BSBI ?", selectionMode: "single", sources: [spimiSourceFr], explanation: "SPIMI ajoute directement aux dynamic postings list au lieu de trier d'abord tous les pair token. ", choices: [
        { key: "a", label: "A", content: "SPIMI ajoute directement les postings a des dynamic postings list au lieu de trier d'abord tous les pair termID-docID.", isCorrect: true },
        { key: "b", label: "B", content: "SPIMI exige deux passes completes sur la collection avant le debut de l'indexing.", isCorrect: false },
        { key: "c", label: "C", content: "SPIMI evite toute ecriture de block sur disk.", isCorrect: false },
        { key: "d", label: "D", content: "SPIMI n'est defini que pour les phrase index.", isCorrect: false },
      ] },
      { key: "q14", prompt: "## Quelle paire de complexite correspond au livre ?", selectionMode: "single", sources: [bsbiSourceFr, spimiSourceFr], explanation: "Le livre donne $\\Theta(T \\log T)$ pour BSBI et $\\Theta(T)$ pour SPIMI. ", choices: [
        { key: "a", label: "A", content: "BSBI: $\\Theta(T \\log T)$ and SPIMI: $\\Theta(T)$", isCorrect: true },
        { key: "b", label: "B", content: "BSBI: $\\Theta(T)$ and SPIMI: $\\Theta(T \\log T)$", isCorrect: false },
        { key: "c", label: "C", content: "Both are $\\Theta(\\log T)$", isCorrect: false },
        { key: "d", label: "D", content: "Both are quadratic in the collection size", isCorrect: false },
      ] },
      { key: "q15", prompt: "## Quelles affirmations sur tf, idf et tf-idf sont correctes ? Selectionnez toutes les bonnes reponses.", selectionMode: "multiple", sources: [tfSourceFr, idfSourceFr, tfIdfSourceFr], explanation: "tf compte les occurrences dans un document, idf utilise $\\log(N / df_t)$ et tf-idf multiplie les deux. ", choices: [
        { key: "a", label: "A", content: "$tf_{t,d}$ is the number of occurrences of term $t$ in document $d$.", isCorrect: true },
        { key: "b", label: "B", content: "$idf_t = \\log(N / df_t)$.", isCorrect: true },
        { key: "c", label: "C", content: "$tf\\text{-}idf_{t,d} = tf_{t,d} \\cdot idf_t$.", isCorrect: true },
        { key: "d", label: "D", content: "Un term present dans presque tous les documents devrait avoir le plus grand idf.", isCorrect: false },
      ] },
      { key: "q16", prompt: "## Dans le ranking model du livre, quand un term recoit-il un tf-idf particulierement eleve ?", selectionMode: "single", sources: [tfIdfSourceFr], explanation: "Le tf-idf est le plus eleve lorsqu'un term apparait souvent dans un petit nombre de documents. ", choices: [
        { key: "a", label: "A", content: "Lorsqu'il apparait souvent dans un petit nombre de documents", isCorrect: true },
        { key: "b", label: "B", content: "Lorsqu'il s'agit d'un stop word present dans presque tous les documents", isCorrect: false },
        { key: "c", label: "C", content: "Lorsqu'il n'apparait jamais dans le query", isCorrect: false },
        { key: "d", label: "D", content: "Lorsqu'il apparait uniquement dans un metadata zone", isCorrect: false },
      ] },
      { key: "q17", prompt: "## Quelle affirmation sur unranked evaluation est correcte ?", selectionMode: "single", sources: [unrankedEvaluationSourceFr], explanation: "Precision est la fraction des documents recuperes qui sont relevant. ", choices: [
        { key: "a", label: "A", content: "Precision est la fraction des documents recuperes qui sont relevant.", isCorrect: true },
        { key: "b", label: "B", content: "Recall est la fraction des documents recuperes qui sont nonrelevant.", isCorrect: false },
        { key: "c", label: "C", content: "accuracy est la mesure principale de l'IR car les documents nonrelevant sont rares.", isCorrect: false },
        { key: "d", label: "D", content: "F1 est la moyenne arithmetique de Precision et Recall.", isCorrect: false },
      ] },
      { key: "q18", prompt: "## Quelles affirmations sur ranked evaluation sont exactes ? Selectionnez toutes les bonnes reponses.", selectionMode: "multiple", sources: [rankedEvaluationSourceFr], explanation: "Le chapitre sur ranked evaluation definit Precision at k sur le haut du classement et MAP comme une moyenne de precision calculee a chaque hit relevant. ", choices: [
        { key: "a", label: "A", content: "Precision at `k` evalue les `k` premiers resultats classes.", isCorrect: true },
        { key: "b", label: "B", content: "MAP moyenne les precision observees a chaque recuperation d'un document relevant, puis moyenne sur les queries.", isCorrect: true },
        { key: "c", label: "C", content: "MAP ignore l'ordre classe et traite seulement la retrieval comme un ensemble non ordonne.", isCorrect: false },
        { key: "d", label: "D", content: "Precision at `k` a surtout ete concu pour les cas ou les premiers resultats comptent, comme le web search.", isCorrect: true },
      ] },
    ],
  },
};