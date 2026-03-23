import type { SupportedArcadeLocale } from "./locale";

type GameCatalogTranslation = Partial<Record<SupportedArcadeLocale, {
  rulesSummary: string;
  shortDescription: string;
}>>;

export const gameCatalogTranslations: Record<string, GameCatalogTranslation> = {
  "color-sweep": {
    ja: { shortDescription: "タイマーが切れる前に、対象の色と一致するすべてのタイルをクリアしてください。", rulesSummary: "対象の色だけがカウントされます。間違ったタップは品質を低下させ、タイムアウトは履歴にのみ残ります。" },
    zh: { shortDescription: "在计时器过期前清除与目标颜色匹配的所有瓷砖。", rulesSummary: "只有目标颜色才算。错误的点击会降低质量，超时只会留在历史记录中。" },
    fr: { shortDescription: "Effacez toutes les tuiles correspondant à la couleur cible avant l'expiration du minuteur.", rulesSummary: "Seule la couleur cible compte. Les mauvais appuis réduisent la qualité et les dépassements ne restent que dans l'historique." }
  },
  "color-census": {
    ja: { shortDescription: "一瞬だけ見える色のモザイクを覚え、どの色が多かったかや何個あったかを答えます。", rulesSummary: "モザイクを記憶し、色の分布に関する問いへ時間内に答えていきます。" },
    zh: { shortDescription: "研究简短的彩色马赛克，然后回答哪种颜色占主导地位或出现的频率。", rulesSummary: "记住马赛克，回答颜色分布查询，并在计时器过期前完成冲刺。" },
    fr: { shortDescription: "Étudiez une brève mosaïque de couleurs, puis répondez quelle couleur a dominé ou comment souvent elle est apparue.", rulesSummary: "Mémorisez la mosaïque, répondez à la requête de distribution des couleurs et terminez le sprint avant l'expiration du minuteur." }
  },
  "beat-match": {
    ja: { shortDescription: "リズムに合わせて光るレーンをタップし、コンボをつないで目標ヒット数を達成してください。", rulesSummary: "アクティブなレーンを拍に合わせて叩き、コンボを伸ばしながら、曲が終わる前か時間切れまでに目標ヒット数へ到達してください。" },
    zh: { shortDescription: "根据节奏敲击突出显示的车道，以建立连击并将命中目标推过线。", rulesSummary: "将活跃的车道与节拍匹配，建立连击，并在流结束或计时器过期前达到命中目标。" },
    fr: { shortDescription: "Tapez la voie surlignée en rythme pour construire une combo et pousser l'objectif sur la ligne.", rulesSummary: "Correspondez la voie active au rythme, construisez une combo et atteignez l'objectif de coup avant la fin du flux ou l'expiration du minuteur." }
  },
  "block-tessellate": {
    ja: { shortDescription: "落ちてくるピースを回転や移動で調整し、盤面をリセットせずに各シルエットをぴったり埋めてください。", rulesSummary: "落下中のピースを目標シルエットへ導き、きれいに収まる場面だけハードドロップを使って、時間切れまでに置きミスを減らしてください。" },
    zh: { shortDescription: "旋转并移动下落中的方块，在不重置棋盘的情况下把每个轮廓严丝合缝地填满。", rulesSummary: "把下落方块引导进目标轮廓，只有在能稳妥落位时才使用硬降，并在计时结束前尽量减少放置失误。" },
    fr: { shortDescription: "Faites pivoter et glisser une file d'attente de pièces tombantes pour que chaque silhouette soit scellée sans réinitialiser le plateau.", rulesSummary: "Guidez la file d'attente tombante dans la silhouette cible, n'utilisez des chutes dures que lorsque le verrou est propre, et maintenez les mauvaises chutes faibles avant l'expiration du minuteur." }
  },
  "bounce-angle": {
    ja: { shortDescription: "固定角度を選び、壁の反射でボールを正しいポケットへ導きます。", rulesSummary: "跳ね返り方を読んでグリーンポケットを狙い、無駄打ちを抑えながら時間内にクリアします。" },
    zh: { shortDescription: "选择一个固定角度，让侧壁反弹将球带入正确的口袋。", rulesSummary: "读取银行射击，发射到绿色口袋中，并在计时器过期前保持浪费的射击次数较少。" },
    fr: { shortDescription: "Choisissez un angle fixe et laissez le ricochet de la paroi latérale porter la balle dans la bonne poche.", rulesSummary: "Lisez le tir en banque, lancez dans la poche verte et gardez les tirs gaspillés faibles avant l'expiration du minuteur." }
  },
  "cascade-flip": {
    ja: { shortDescription: "短い公開で順番を覚え、流れてくるカードを同じ順に選びます。", rulesSummary: "見せられた順序を記憶し、動くストリームの中から正しい順番でタップします。" },
    zh: { shortDescription: "观看简短的显示，然后从移动的卡牌流中以相同的顺序翻转。", rulesSummary: "记住显示顺序，跟踪移动的流，并在计时器过期前保持低失误。" },
    fr: { shortDescription: "Regardez une brève révélation, puis retournez le même ordre par rapport à un flux de cartes en déplacement.", rulesSummary: "Mémorisez l'ordre de révélation, suivez le flux mobile et maintenez les manquements faibles avant l'expiration du minuteur." }
  },
  "gap-rush": {
    ja: { shortDescription: "固定された壁シーケンスを通してドリフト中の走者をガイドし、速度ランプを生き残るのに十分に早く次のレーンを選択してください。", rulesSummary: "ランナーを1つのレーンずつリターゲットし、各壁が到着する前に滑空を落ち着かせ、廊下が速くなるときに完璧なパスのために中央に留まってください。" },
    zh: { shortDescription: "提前选择下一条跑道，引导漂移中的角色穿过固定墙列并撑过加速阶段。", rulesSummary: "每次只调整一条跑道，让移动轨迹在下一面墙到来前稳定下来，并在走廊加速时尽量保持居中通过。" },
    fr: { shortDescription: "Guidez un coureur à la dérive à travers une séquence de murs fixes en choisissant la prochaine voie suffisamment tôt pour survivre à la rampe de vitesse.", rulesSummary: "Reciblez le coureur une voie à la fois, laissez le glissement se stabiliser avant chaque mur qui arrive et restez centré pour des passes parfaites à mesure que le couloir s'accélère." }
  },
  "bubble-spawn": {
    ja: { shortDescription: "成長パルスと連鎖バースト競争スペースと安定性がライブバブルフィールドを管理してください。", rulesSummary: "最大の圧力クラスターをバーストさせてから次の成長パルスが着陸し、飽和をフィールドの制限以下に保ち、ボードが過負荷になる前に安定性を入力してください。" },
    zh: { shortDescription: "管理一个实时气泡字段，其中成长脉冲和连锁爆炸争夺空间和稳定性。", rulesSummary: "在下一个成长脉冲落地前突发最大压力群集，保持饱和度低于字段限制，并在电路板过载前填充稳定性。" },
    fr: { shortDescription: "Gérez un champ de bulles en direct où les impulsions de croissance et les rafales de chaînes concourent pour l'espace et la stabilité.", rulesSummary: "Éclatez le plus grand groupe de pression avant l'arrivée de la prochaine impulsion de croissance, maintenez la saturation en dessous de la limite du champ et remplissez la stabilité avant que le plateau ne se surcharge." }
  },
  "box-fill": {
    ja: { shortDescription: "小さなトレイのピースを回転させながら、不規則な箱をぴったり埋めていきます。", rulesSummary: "ピースを選んで向きを合わせ、配置位置を確かめながら箱全体を時間内に埋めます。" },
    zh: { shortDescription: "用小盘子的棋子包装不规则的盒子，使用旋转和锚点预览来避免浪费的配合。", rulesSummary: "选择一个托盘棋子，将其旋转到正确的足迹中，一次预览一个锚点，并在计时器过期前打包整个不规则的盒子。" },
    fr: { shortDescription: "Remplissez une boîte irrégulière avec un petit plateau de pièces, en utilisant la rotation et les aperçus d'ancrage pour éviter les ajustements gaspillés.", rulesSummary: "Sélectionnez une pièce de plateau, faites-la pivoter dans la bonne empreinte, prévisualisez un ancrage à la fois et remplissez toute la boîte irrégulière avant l'expiration du minuteur." }
  },
  "line-connect": {
    ja: { shortDescription: "対応するペアを線でつなぎ、盤面をふさがないように経路を組み立てます。", rulesSummary: "線を少しずつ伸ばしながら全てのペアを結び、交差や行き止まりを避けて時間内に完成させます。" },
    zh: { shortDescription: "使用触摸安全段连接节点对，在路由阻止棋盘时使用撤销和重置。", rulesSummary: "一次构建一条路由，保持每条路径不穿过锁定的车道，并在计时器过期前完成棋盘集。" },
    fr: { shortDescription: "Connectez les paires de nœuds avec des segments sûrs au toucher, en utilisant l'annulation et les réinitialisations lorsqu'une route bloque le tableau.", rulesSummary: "Construisez chaque itinéraire un segment à la fois, gardez chaque chemin de traverser les voies verrouillées et terminez l'ensemble du tableau avant l'expiration du minuteur." }
  },
  "chain-trigger": {
    ja: { shortDescription: "少数の補助ノードを有効化してからソースを起動し、決定的な連鎖反応を組み立ててください。", rulesSummary: "必要最小限の補助ノードを有効化し、ソースを起動して、時間切れまでに各トリガーグラフを解き切ってください。" },
    zh: { shortDescription: "通过在火源之前装备一些额外的节点来计划确定性触发链。", rulesSummary: "装备最小有用的助手集，射击源，并在计时器过期前求解每个触发图。" },
    fr: { shortDescription: "Planifiez une chaîne de déclenchement déterministe en armant quelques nœuds supplémentaires avant de tirer sur la source.", rulesSummary: "Armez l'ensemble d'aide le plus petit utile, tirez sur la source et résolvez chaque graphe de déclenchement avant l'expiration du minuteur." }
  },
  "icon-chain": {
    ja: { shortDescription: "公開された情報を手がかりに、隠れたアイコンの並びを最初から最後まで復元してください。", rulesSummary: "アイコンの順番を覚えたうえで、アンカーや配置枠、順序のヒントからチェーン全体を組み立て直してください。" },
    zh: { shortDescription: "根据已公开的信息，利用线索板把隐藏图标的顺序从头到尾还原出来。", rulesSummary: "先记住图标顺序，再根据锚点、位置槽和先后提示把整条链重新拼出来。" },
    fr: { shortDescription: "Lisez la révélation, puis utilisez le tableau des indices pour reconstruire l'ordre des icônes masquées du début à la fin.", rulesSummary: "Mémorisez l'ordre des icônes, puis reconstruisez la chaîne à partir des indices d'ancrage, d'emplacement et d'ordre avant l'expiration du minuteur." }
  },
  "merge-climb": {
    ja: { shortDescription: "盤面を滑らせて同じ数字をまとめ、より大きな値を作っていきます。", rulesSummary: "数字を合体させながらスペースを確保し、盤面が詰まる前に目標値へ到達します。" },
    zh: { shortDescription: "在每次移动后都会补入新方块的棋盘上，把相同数字合并成更高的数值。", rulesSummary: "滑动数字棋盘、合并相同方块，并在棋盘被堵死或计时结束前达到目标数值。" },
    fr: { shortDescription: "Fusionnez les tuiles correspondantes en une valeur plus élevée tandis que le tableau se remplit de nouveaux frai après chaque mouvement.", rulesSummary: "Faites glisser le plateau de nombres, combinez les tuiles correspondantes et atteignez la valeur cible avant que le plateau ne se verrouille ou que le minuteur n'expire." }
  },
  "relative-pitch": {
    ja: { shortDescription: "基準となる音の幅を聞き取り、新しい基音から同じ間隔になる答えを選びます。", rulesSummary: "基準音程と新しい基音を聞いたあと、同じ音程差になる候補を時間内に選択します。" },
    zh: { shortDescription: "在短暂的听力训练冲刺中从新的基础音符匹配相同的音高间隔。", rulesSummary: "听参考跳转，听新的基础音符，并选择在计时器过期前重现相同间隔的候选。" },
    fr: { shortDescription: "Retrouvez le même intervalle à partir d'une nouvelle note de départ dans un court sprint d'entraînement auditif.", rulesSummary: "Écoutez l'intervalle de référence, la nouvelle note de départ, puis choisissez la réponse qui recrée le même écart avant la fin du chrono." }
  },
  "cascade-clear": {
    ja: { shortDescription: "最大リキャッシュカスケードを作成し、スコア目標をラインを超えてプッシュする行または列トリガーを選択してください。", rulesSummary: "一度に1つの行または列トリガーをファイアし、ボードを折りたたんでリフィルさせ、トリガー制限が実行される前に高スコアのチェーンを追いかけてください。" },
    zh: { shortDescription: "选择行或列触发器，制造最大的连锁消除，并把分数推过目标线。", rulesSummary: "逐次触发行或列，让棋盘塌落并重新补满，在触发次数耗尽前尽量打出高分连锁。" },
    fr: { shortDescription: "Choisissez un déclencheur de ligne ou de colonne qui crée la plus grande cascade de remplissage et pousse l'objectif de score au-delà de la ligne.", rulesSummary: "Tirez un déclencheur de ligne ou de colonne à la fois, laissez le plateau s'effondrer et se remplir, et poursuivez une chaîne à haut score avant que votre limite de déclenchement n'épuise." }
  },
  "minesweeper": {
    ja: { shortDescription: "ミスを低く保ちながら、ボードを迅速にクリアしてください。", rulesSummary: "すべての安全なタイルを表示してください。ミスは品質スコアとリーダーボードのポイントがかかります。" },
    zh: { shortDescription: "快速清除棋盘，同时保持错误次数较少。", rulesSummary: "显示所有安全的瓷砖。错误会影响质量分数和排行榜上的积分。" },
    fr: { shortDescription: "Effacez le tableau rapidement tout en gardant les erreurs faibles.", rulesSummary: "Révélez toutes les tuiles sûres. Les erreurs coûtent un score de qualité et des points du classement." }
  },
  "number-chain": {
    ja: { shortDescription: "タイマーが切れる前に昇順でシャッフルされた数字をタップしてください。", rulesSummary: "次の数字だけがチェーンを進めます。間違ったタップは品質を低下させ、タイムアウトは履歴にのみ残ります。" },
    zh: { shortDescription: "在计时器过期前按升序点击打乱的数字。", rulesSummary: "只有下一个数字推进链。错误的点击会降低质量，超时只会留在历史记录中。" },
    fr: { shortDescription: "Appuyez sur les nombres mélangés dans l'ordre croissant avant l'expiration du minuteur.", rulesSummary: "Seul le nombre suivant avance la chaîne. Les mauvais appuis réduisent la qualité et les dépassements ne restent que dans l'historique." }
  },
  "pair-flip": {
    ja: { shortDescription: "タイマーが切れる前に2つずつカードを裏返し、すべてのシンボルを一致させてください。", rulesSummary: "一致しないカードは短い公開後に反転します。タイムアウトは履歴にのみ残ります。" },
    zh: { shortDescription: "一次两个翻卡，并在计时器过期前匹配每个符号。", rulesSummary: "不匹配的卡在短暂显示后翻转回来。超时只会留在历史记录中。" },
    fr: { shortDescription: "Retournez les cartes deux à deux et faites correspondre tous les symboles avant l'expiration du minuteur.", rulesSummary: "Les cartes mal assorties se retournent après une brève révélation. Les dépassements ne restent que dans l'historique." }
  },
  "sudoku": {
    ja: { shortDescription: "ヒントと誤りができるだけ少ないでグリッドを完了してください。", rulesSummary: "パズルを速く終了させてください。ヒントは品質を低下させ、リーダーボードの適格性を削除できます。" },
    zh: { shortDescription: "以尽可能少的提示和错误完成网格。", rulesSummary: "快速完成拼图。提示会降低质量，并可能会删除排行榜资格。" },
    fr: { shortDescription: "Complétez la grille avec aussi peu d'indices et d'erreurs que possible.", rulesSummary: "Terminez le puzzle rapidement. Les indices réduisent la qualité et peuvent supprimer l'admissibilité du classement." }
  },
  "pattern-echo": {
    ja: { shortDescription: "点滅するパッドの並びを見てから、同じ順番で正確に再現してください。", rulesSummary: "間違った入力は品質を下げますが、ラン自体は止まりません。タイムアウトは履歴にのみ残ります。" },
    zh: { shortDescription: "观看垫序列闪烁，然后以完全相同的顺序重现。", rulesSummary: "错误的输入计入质量但不停止运行。超时只会留在历史记录中。" },
    fr: { shortDescription: "Regardez la séquence de pads s'illuminer, puis reproduisez-la exactement dans le même ordre.", rulesSummary: "Les entrées incorrectes réduisent la qualité sans arrêter la manche. Les dépassements ne restent que dans l'historique." }
  },
  "sequence-point": {
    ja: { shortDescription: "伸びていく点の並びを覚え、時間切れになる前に同じ順番で再現してください。", rulesSummary: "点のシーケンスを見て順番どおりに再現し、タイマーが切れる前にスプリント全体を完了してください。" },
    zh: { shortDescription: "记住不断增长的点位序列，并在时间结束前按顺序重现。", rulesSummary: "观察点位序列，按顺序重放，并在计时器结束前完成整段冲刺。" },
    fr: { shortDescription: "Rejouez une séquence de points croissante de mémoire avant que le temps ne s'écoule.", rulesSummary: "Regardez la séquence de points, rejouez-la dans l'ordre et terminez le sprint complet avant l'expiration du minuteur." }
  },
  "precision-drop": {
    ja: { shortDescription: "落下するボールがターゲットラインと重なるときをタップして、オフセットを小さく保ってください。", rulesSummary: "より小さいヒットオフセットが良いスコアを獲得します。ミスされたドロップは履歴にのみ残り、ランキングに入力されません。" },
    zh: { shortDescription: "当下落的球与目标线重叠时点击，以保持偏移量很小。", rulesSummary: "较小的命中偏移得分更好。错过的掉落只留在历史记录中，不进入排行榜。" },
    fr: { shortDescription: "Appuyez lorsque la balle qui tombe se chevauche la ligne cible pour maintenir le décalage minuscule.", rulesSummary: "Un décalage de frappe plus petit marque mieux. Les chutes manquées ne restent que dans l'historique et n'entrent pas dans les classements." }
  },
  "spinner-aim": {
    ja: { shortDescription: "回転するランチャーの角度を見極め、危険弧を避けてターゲットアークに合わせて発射してください。", rulesSummary: "ターゲットアークを通るタイミングで発射し、危険なアークを避けながら、時間切れまでに無駄撃ちを減らしてください。" },
    zh: { shortDescription: "对每次射击进行时间，使得旋转发射器通过目标电弧而不是危险电弧。", rulesSummary: "通过目标弧射击，避免危险弧，并在计时器过期前保持坏射击次数较少。" },
    fr: { shortDescription: "Chronométrez chaque tir pour que le lanceur rotatif passe par l'arc cible au lieu de l'arc de danger.", rulesSummary: "Tirez à travers l'arc cible, évitez l'arc de danger et gardez les mauvais tirs faibles avant l'expiration du minuteur." }
  },
  "phase-lock": {
    ja: { shortDescription: "マーカーがターゲットバンド内に配置されている間、シーケンスで各回転ホイールを凍結してください。", rulesSummary: "各ホイールをターゲットバンド内でロックし、タイミングエラーを少なく保ち、タイマーが切れる前に全体のスタックを完了してください。" },
    zh: { shortDescription: "在序列中冻结每个旋转轮，同时其标记位于目标带内。", rulesSummary: "将每个车轮锁定在其目标带内，保持低时序错误，并在计时器过期前完成全部堆栈。" },
    fr: { shortDescription: "Verrouillez chaque roue rotative en séquence tandis que son marqueur se trouve dans la bande cible.", rulesSummary: "Verrouillez chaque roue dans sa bande cible, gardez les erreurs de synchronisation faibles et terminez la pile complète avant l'expiration du minuteur." }
  },
  "sync-pulse": {
    ja: { shortDescription: "デュアルパルスオーバーラップを読み、両方のリングが同じビートに崩壊するときをタップしてください。", rulesSummary: "両方のパルスリングが重なっている間にタップし、すべての波をチェーンし、タイマーが切れる前に完璧なシンクを高く保ってください。" },
    zh: { shortDescription: "阅读双脉冲重叠，并在两个环都崩溃到同一节拍时点击。", rulesSummary: "在两个脉冲环重叠时点击，链接每个波，并在计时器过期前保持高完美同步。" },
    fr: { shortDescription: "Lisez le chevauchement de pulsation duelle et appuyez lorsque les deux anneaux s'effondrent dans le même rythme.", rulesSummary: "Appuyez pendant que les deux anneaux de pulsation se chevauchent, chaîne chaque vague et gardez les synchronisations parfaites élevées avant l'expiration du minuteur." }
  },
  "glow-cycle": {
    ja: { shortDescription: "盤面全体の脈動が頂点でそろう瞬間を見極め、光っているノードをタップしてください。", rulesSummary: "ボード全体の脈動を見ながら共通のピークを待ち、時間切れまでにハイライトされたノードを正確に押してください。" },
    zh: { shortDescription: "观察整块脉冲面板同步起伏，只在共振达到高点时点击高亮节点。", rulesSummary: "留意整块脉冲面板的同步节奏，等到共享峰值出现时再点击高亮节点，并在计时结束前完成挑战。" },
    fr: { shortDescription: "Appuyez sur le nœud mis en évidence uniquement lorsque l'ensemble du plateau atteint son pic de pulsation.", rulesSummary: "Observez tout le plateau, attendez le pic partagé, puis appuyez sur le nœud mis en évidence avant la fin du chrono." }
  },
  "tempo-hold": {
    ja: { shortDescription: "押したままキープし、メーターが目標テンポの範囲に入った瞬間に離してください。", rulesSummary: "狙った長さまで押し続け、正しいゾーンで離して、時間切れまでにすべてのラウンドをこなしてください。" },
    zh: { shortDescription: "按下並按住，然后在计量器达到目标节奏窗口时释放。", rulesSummary: "按照目标持续时间保持，在正确的区域释放，并在计时器过期前完成每一轮。" },
    fr: { shortDescription: "Appuyez et maintenez, puis relâchez lorsque le compteur atteint la fenêtre de tempo cible.", rulesSummary: "Maintenez la durée cible, relâchez dans la bonne zone et terminez chaque round avant l'expiration du minuteur." }
  },
  "tempo-weave": {
    ja: { shortDescription: "2つの独立したビートレーンを追跡し、そのマーカーが中央ターゲットゾーンを横切るときにそれぞれをタップしてください。", rulesSummary: "両方のレーンを見て、各中央ゾーンを時間に合わせてヒットし、タイマーが終わる前に分割注意のストリークを保ってください。" },
    zh: { shortDescription: "跟踪两个独立的节拍通道，只在其标记穿过中心目标区域时点击。", rulesSummary: "观看两条通道，按时击中每个中心区域，并在计时器结束前保持分割注意冲刺活动。" },
    fr: { shortDescription: "Suivez deux voies de rythme indépendantes et appuyez sur chacune au moment où son marqueur traverse la zone cible centrale.", rulesSummary: "Surveillez les deux voies, frappez chaque zone centrale en rythme et gardez votre série d'attention partagée jusqu'à la fin du chrono." }
  },
  "orbit-tap": {
    ja: { shortDescription: "周回するマーカーがゲートを通る瞬間を狙ってタップします。", rulesSummary: "ゲート通過のタイミングを合わせてヒットを重ね、ミスを抑えながら時間内に目標回数へ届かせます。" },
    zh: { shortDescription: "当轨道标记穿过目标门时点击，连续命中足够次数即可完成挑战。", rulesSummary: "在计时结束前反复精准击中目标门。失误会降低质量，超时只会保留在历史记录中。" },
    fr: { shortDescription: "Appuyez lorsque le marqueur d'orbite traverse la porte et enchaînez suffisamment de coups pour exécuter clairement.", rulesSummary: "Frappez la porte à plusieurs reprises avant l'expiration du minuteur. Les manquements réduisent la qualité et les dépassements ne restent que dans l'historique." }
  },
  "target-trail": {
    ja: { shortDescription: "ボード全体で活動的なターゲットを追跡し、タイマーが切れる前にトレイルを完了してください。", rulesSummary: "ライブターゲットだけがトレイルを進めます。ミスは品質を低下させ、タイムアウトは履歴にのみ残ります。" },
    zh: { shortDescription: "追踪棋盘上的活动目标，并在计时器过期前完成步道。", rulesSummary: "只有实时目標推进步道。错过会降低质量，超时只会留在历史记录中。" },
    fr: { shortDescription: "Suivez la cible active sur le tableau et terminez la piste avant l'expiration du minuteur.", rulesSummary: "Seule la cible en direct avance la piste. Les manquements réduisent la qualité et les dépassements ne restent que dans l'historique." }
  },
  "path-recall": {
    ja: { shortDescription: "ハイライトされた道順を覚えたあと、記憶を頼りに1マスずつたどってください。", rulesSummary: "表示されたルートを確認してから同じ順番でなぞり直し、時間切れまでに誤ったマスを減らしてください。" },
    zh: { shortDescription: "记住突出显示的路径，然后从内存中逐个单元格沿着它。", rulesSummary: "观看路径，按顺序重放，并在计时器过期前保持低错误单元格。" },
    fr: { shortDescription: "Mémorisez le chemin en surbrillance, puis retracez-le cellule par cellule de mémoire.", rulesSummary: "Regardez le chemin, rejouez-le dans l'ordre et maintenez les cellules incorrectes faibles avant l'expiration du minuteur." }
  },
  "position-lock": {
    ja: { shortDescription: "動くトークンがどこで止まるかを覚え、各トークンを最後の位置に戻してください。", rulesSummary: "トークンが落ち着く場所を見届けてから、記憶を頼りに最終レイアウトを再現し、時間切れまでに配置ミスを抑えてください。" },
    zh: { shortDescription: "记住移动的令牌停止的位置，然后将每个令牌放回其最终单元。", rulesSummary: "观看令牌解决，从内存中重建最终布局，并在计时器过期前保持低放置错误。" },
    fr: { shortDescription: "Mémorisez où s'arrêtent les jetons mobiles, puis replacez chacun dans sa case finale.", rulesSummary: "Regardez où les jetons s'immobilisent, reconstituez la disposition finale de mémoire et limitez les erreurs de placement avant la fin du chrono." }
  },
  "pulse-count": {
    ja: { shortDescription: "信号の点滅回数を見極め、短い回答ラウンドで正しい数を選んでください。", rulesSummary: "パルスの回数を数えて素早く答え、時間切れまでに誤答を抑えてください。" },
    zh: { shortDescription: "观察信号脉冲，然后在短暂答案冲刺中选择正确的计数。", rulesSummary: "计数脉冲，快速回答，并在计时器过期前保持低错误答案。" },
    fr: { shortDescription: "Regardez l'impulsion du signal, puis choisissez le bon compte dans un court sprint de réponse.", rulesSummary: "Comptez les impulsions, répondez rapidement et maintenez les mauvaises réponses faibles avant l'expiration du minuteur." }
  },
  "quick-sum": {
    ja: { shortDescription: "各ラウンドで正しい答えを選び、計算問題の連続チャレンジを素早く解いてください。", rulesSummary: "各問題をすばやく解いてください。間違った回答は品質を下げ、タイムアウトは履歴にのみ残ります。" },
    zh: { shortDescription: "通过在每一轮中选择正确答案，清除快速的算术提示。", rulesSummary: "快速解决每个提示。错误答案会降低质量，超时只会留在历史记录中。" },
    fr: { shortDescription: "Effacez une exécution rapide d'invites arithmétiques en choisissant la bonne réponse chaque tour.", rulesSummary: "Résolvez rapidement chaque invite. Les mauvaises réponses réduisent la qualité et les dépassements ne restent que dans l'historique." }
  },
  "sum-grid": {
    ja: { shortDescription: "候補の数字をグリッドに配置し、すべての行と列の合計を目標値にぴったり合わせてください。", rulesSummary: "候補の数字を置いて、すべての行と列が目標値に一致するようにしてください。グリッドのリセットは品質を下げ、タイムアウトは履歴にのみ残ります。" },
    zh: { shortDescription: "使用候选数字填充网格，以便每行总和和列总和恰好落在目标上。", rulesSummary: "放置候选数字，以便每行和列都达到其目标。重置网格会降低质量，超时只会留在历史记录中。" },
    fr: { shortDescription: "Placez les nombres proposés dans la grille pour que chaque ligne et chaque colonne atteignent exactement leur total cible.", rulesSummary: "Placez les nombres candidats pour que chaque ligne et chaque colonne atteignent leur cible. Les réinitialisations de grille réduisent la qualité et les dépassements ne restent que dans l'historique." }
  },
  "symbol-hunt": {
    ja: { shortDescription: "入り組んだ盤面の中から、制限時間内に対象シンボルをすべて見つけてください。", rulesSummary: "数に入るのは対象シンボルだけです。誤タップは品質を下げ、タイムアウトは履歴にのみ残ります。" },
    zh: { shortDescription: "在时间用完之前，找到所有隐藏在嘈杂棋盘中的目标符号副本。", rulesSummary: "只有目标符号才算。错误的点击会降低质量，超时只会留在历史记录中。" },
    fr: { shortDescription: "Trouvez chaque copie du symbole cible caché dans le tableau bruyant avant que le temps ne s'écoule.", rulesSummary: "Seul le symbole cible compte. Les mauvais appuis réduisent la qualité et les dépassements ne restent que dans l'historique." }
  },
  "hidden-find": {
    ja: { shortDescription: "時間がなくなる前に、各シーンの中に隠れたモチーフを1つ見つけてください。", rulesSummary: "各ぎゅうぎゅう詰めシーンでは正確にターゲットモチーフを見つけてください。錯誤タップは品質を低下させ、タイムアウトは履歴にのみ残ります。" },
    zh: { shortDescription: "在每个拥挤的场景中找出唯一正确的隐藏图案，并在时间结束前完成。", rulesSummary: "在每个拥挤场景中准确找出目标图案。误点会降低质量，超时只会保留在历史记录中。" },
    fr: { shortDescription: "Sélectionnez le motif exact unique caché dans chaque scène dense de sosies avant que le temps ne s'écoule.", rulesSummary: "Trouvez le motif cible exact dans chaque scène bondée. Les faux appuis réduisent la qualité et les dépassements ne restent que dans l'historique." }
  },
  "hue-drift": {
    ja: { shortDescription: "色の流れを見て、途中で欠けている色を推理します。", rulesSummary: "グラデーションの変化を読み取り、足りない色を選んで時間内に答え続けます。" },
    zh: { shortDescription: "观察逐渐偏移的渐变色列，推断缺失的颜色步骤，并在时间结束前完成作答。", rulesSummary: "读出颜色渐变的变化规律，选出缺失的一步，并在计时结束前完成整轮冲刺。" },
    fr: { shortDescription: "Déduire l'étape de couleur manquante d'une rangée de gradient à la dérive avant que le temps ne s'écoule.", rulesSummary: "Lisez la dérive des couleurs, choisissez l'étape manquante et terminez le sprint avant l'expiration du minuteur." }
  },
  "spot-change": {
    ja: { shortDescription: "2つの場面を見比べて、変わった場所をすべて見つけます。", rulesSummary: "元の場面と変更後の場面を比較し、本当に違う箇所だけを時間内にタップします。" },
    zh: { shortDescription: "对比两块场景面板，在时间结束前找出并点击所有发生变化的格子。", rulesSummary: "比较原始场景与变化后的场景，只点击真正不同的地方，并在计时结束前完成。" },
    fr: { shortDescription: "Comparez deux tableaux de scènes et appuyez sur chaque tuile modifiée avant l'expiration du minuteur.", rulesSummary: "Comparez les scènes d'origine et modifiées, appuyez uniquement sur les vraies différences et terminez avant l'expiration du minuteur." }
  },
  "tap-safe": {
    ja: { shortDescription: "次々に現れるターゲットの中から、安全なものだけを素早くタップします。", rulesSummary: "危険物を避けつつ安全なターゲットを見分け、取り逃しや誤タップを抑えて進めます。" },
    zh: { shortDescription: "在短命的危险波将压力施加到您的反射时，仅点击安全目标。", rulesSummary: "快速过滤每个波。危险点击和错过的安全目标添加处罚，超时只保留在历史记录中。" },
    fr: { shortDescription: "Appuyez uniquement sur les cibles sûres tandis que les ondes de danger éphémères pressent vos réflexes.", rulesSummary: "Filtrez rapidement chaque vague. Les appuis dangereux et les cibles sûres manquées ajoutent des pénalités et les dépassements ne restent que dans l'historique." }
  },
  "light-grid": {
    ja: { shortDescription: "ライトの配置を切り替えて、盤面をターゲットパターンと一致させてください。", rulesSummary: "盤面をターゲット状態に切り替えてください。余計な手数は品質を下げ、タイムアウトは履歴にのみ残ります。" },
    zh: { shortDescription: "切换灯格，直到当前棋盘与目标图案一致。", rulesSummary: "把棋盘切换到目标状态。多余的步数会降低质量，超时只会留在历史记录中。" },
    fr: { shortDescription: "Basculez les cases lumineuses jusqu'à ce que le plateau corresponde au motif cible.", rulesSummary: "Faites passer le plateau à l'état cible. Les mouvements supplémentaires réduisent la qualité et les dépassements ne restent que dans l'historique." }
  },
  "flip-match": {
    ja: { shortDescription: "各ターゲットシルエットに合うまでカードの状態を切り替え、短いロジックスプリントを突破してください。", rulesSummary: "1つのタイルを反転させて横一列を切り替え、すべてのターゲット盤面に一致させてから、時間切れ前にスプリントを完了してください。" },
    zh: { shortDescription: "在短促的逻辑挑战中不断翻转卡片棋盘，直到它与每个目标图案一致。", rulesSummary: "翻转单个方块会带动整条横带切换状态，让棋盘依次匹配每个目标图案，并在计时结束前完成冲刺。" },
    fr: { shortDescription: "Basculez le plateau de cartes live jusqu'à ce qu'il corresponde à chaque silhouette cible dans un court sprint de logique.", rulesSummary: "Retournez une tuile pour permuter une bande horizontale, faites correspondre chaque tableau cible et terminez le sprint avant l'expiration du minuteur." }
  },
  "rotate-align": {
    ja: { shortDescription: "道のタイルを回転させて、スタートからゴールまで線をつなげます。", rulesSummary: "各タイルの向きを整え、道が切れないようにつなぎながら時間内に全問を解きます。" },
    zh: { shortDescription: "通过旋转路径瓷砖直到启动到端行完整来恢復路由。", rulesSummary: "旋转路径瓷砖，连接开始到结束，并在全部冲刺完成前完成。" },
    fr: { shortDescription: "Restaurez l'itinéraire en faisant pivoter les tuiles de chemin jusqu'à ce que la ligne de début à fin soit complète.", rulesSummary: "Faites pivoter les tuiles de chemin, connectez le début à la fin et terminez le sprint complet avant l'expiration du minuteur." }
  },
  "tile-shift": {
    ja: { shortDescription: "行と列をずらして、盤面のパターンをターゲットボードに一致させてください。", rulesSummary: "行と列を順番にずらして正しい配置に戻してください。余計な手数は品質を下げ、タイムアウトは履歴にのみ残ります。" },
    zh: { shortDescription: "旋转行和列，直到当前图案与目标棋盘一致。", rulesSummary: "移动行和列，让棋盘回到正确的位置。多余的步数会降低质量，超时只会留在历史记录中。" },
    fr: { shortDescription: "Faites pivoter les lignes et les colonnes jusqu'à ce que le motif live corresponde au tableau cible.", rulesSummary: "Déplacez les lignes et les colonnes en place. Les mouvements supplémentaires réduisent la qualité et les dépassements ne restent que dans l'historique." }
  },
  "swap-solve": {
    ja: { shortDescription: "交換回数や制限時間が尽きる前に、2枚ずつ入れ替えてシャッフルされた盤面を元に戻してください。", rulesSummary: "2枚ずつタイルを入れ替えてターゲット盤面に戻してください。余計な交換は品質を下げ、失敗した盤面は履歴にのみ残ります。" },
    zh: { shortDescription: "在交换次数或时间耗尽前，两两交换方块，把打乱的棋盘恢复原状。", rulesSummary: "每次交换两块方块，直到当前棋盘与目标一致。额外的交换会降低质量，失败的棋盘只会保留在历史记录中。" },
    fr: { shortDescription: "Restaurez le plateau brouillé en échangeant des paires de tuiles avant que le budget d'échange ou le minuteur ne s'épuisent.", rulesSummary: "Échangez deux tuiles à la fois jusqu'à ce que le plateau live corresponde à la cible. Les échanges supplémentaires réduisent la qualité et les plateaux défaillants ne restent que dans l'historique." }
  },
  "tile-instant": {
    ja: { shortDescription: "一瞬だけ表示されるターゲット盤面を覚え、記憶を頼りにタイルを入れ替えて再現してください。", rulesSummary: "表示された盤面をすばやく記憶してから、タイルを入れ替えて隠れたターゲットを再構築し、タイマーが切れる前に完成させてください。" },
    zh: { shortDescription: "短暂记住目标棋盘，再凭记忆交换方块，恢复相同布局。", rulesSummary: "先快速记住棋盘，再通过交换当前方块重建隐藏目标，并在计时结束前完成。" },
    fr: { shortDescription: "Flash-mémorisez le tableau cible, puis échangez les tuiles pour revenir au même arrangement de la mémoire.", rulesSummary: "Mémorisez rapidement le plateau, puis reconstruisez la cible masquée en échangeant les tuiles live avant l'expiration du minuteur." }
  },
  "zone-lock": {
    ja: { shortDescription: "重なり合うゾーン条件を見ながら、共有マスを切り替えて全条件を同時に満たします。", rulesSummary: "共有セルの状態を調整し、すべてのゾーンが目標カウントに届く形を時間内に作ります。" },
    zh: { shortDescription: "阅读重叠的区域卡，然后锁定单元，直到每个目标计数都保持在线。", rulesSummary: "切换共享单元格，直到每个重叠区域到达其目标计数，然后在计时器过期前。" },
    fr: { shortDescription: "Lisez les cartes de zone qui se chevauchent, puis verrouillez les cellules jusqu'à ce que chaque compte cible soit maintenu à la fois.", rulesSummary: "Basculez les cellules partagées jusqu'à ce que chaque zone qui se chevauchent atteigne son compte cible avant l'expiration du minuteur." }
  },
  "stack-sort": {
    ja: { shortDescription: "各スタックが1色だけになるまで、いちばん上のトークンを移動して並べ替えてください。", rulesSummary: "スタックをすばやく整理してください。余計な移動は品質を下げ、タイムアウトは履歴にのみ残ります。" },
    zh: { shortDescription: "在堆栈之间移动顶部令牌，直到每个堆栈只保持一种颜色。", rulesSummary: "快速排序堆栈。额外的移动会降低质量，超时只会留在历史记录中。" },
    fr: { shortDescription: "Déplacez le jeton supérieur entre les piles jusqu'à ce que chaque pile ne contienne qu'une seule couleur.", rulesSummary: "Triez rapidement les piles. Les mouvements supplémentaires réduisent la qualité et les dépassements ne restent que dans l'historique." }
  },
  "mirror-match": {
    ja: { shortDescription: "タイマーが切れる前に、編集可能なグリッド上のミラーターゲットパターンを再構築してください。", rulesSummary: "ターゲットボードを迅速にミラーしてください。追加の移動は品質を低下させ、タイムアウトは履歴にのみ残ります。" },
    zh: { shortDescription: "在计时器过期前重建可编辑网格上的镜像目标图案。", rulesSummary: "快速镜像目标棋盘。额外的移动会降低质量，超时只会留在历史记录中。" },
    fr: { shortDescription: "Reconstruisez le motif cible en miroir sur la grille modifiable avant l'expiration du minuteur.", rulesSummary: "Reflétez rapidement le tableau cible. Les mouvements supplémentaires réduisent la qualité et les dépassements ne restent que dans l'historique." }
  },
  "shape-morph": {
    ja: { shortDescription: "図形の変化パターンを読み取り、次に来る形を予測します。", rulesSummary: "回転や拡大縮小などの変化ルールを見抜き、次の候補を素早く選んで誤答を抑えます。" },
    zh: { shortDescription: "通过阅读旋转、缩放或切割如何在序列中改变来预测下一个变换的形状。", rulesSummary: "读取视觉变换规则，快速选择下一个字形，并在计时器过期前保持低错误答案。" },
    fr: { shortDescription: "Prédisez la prochaine forme transformée en lisant comment la rotation, l'échelle ou les coupes changent dans la séquence.", rulesSummary: "Lisez la règle de transformation visuelle, choisissez rapidement le prochain glyphe et maintenez les mauvaises réponses faibles avant l'expiration du minuteur." }
  }
} as const;
