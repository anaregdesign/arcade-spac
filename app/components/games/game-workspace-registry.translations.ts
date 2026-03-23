import type { SupportedArcadeLocale } from "../../lib/domain/entities/locale";
import type { GameInstructions } from "../gameplay/workspace/GameInstructionsDialog";

export const gameInstructionsTranslations = {
  "beat-match": {
    ja: {
      title: "Beat Match の遊び方",
      summary: "狙うレーンを見極め、マーカーが中央に重なった瞬間に正しいレーンをタップします。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押してビートストリームをアーム。" },
            { label: "ヒットを構築", detail: "パーフェクトとグッドタップの両方がヒット目標を上げる。ミスはコンボを壊してストリームを進める。" },
            { label: "終了または失敗", detail: "ヒット目標に達するとランクリア。ストリームが終了またはタイマー切れの場合、ランは失敗。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "アクティブレーンを読む", detail: "一度に一つのレーンがアクティブで、キューが次のビートをプレビューする。" },
            { label: "センタゾーンを監視", detail: "タイミングマーカーがセンタゾーンを横切る間にタップしてパーフェクトまたはグッドヒット。" },
            { label: "タッチセーフに保つ", detail: "3つのレーンボタンすべてが大きく均等に配置されている。" },
          ],
        },
      ],
    },
    zh: {
      title: "节拍匹配控制",
      summary: "读取活跃车道，等待计时标记穿过中心区，点击匹配的车道保持连击。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来启动节拍流。" },
            { label: "构建hit数", detail: "完美和不错的点击都能提高命中目标。失误会破坏连击并推进流。" },
            { label: "完成或失败", detail: "达到命中目标即可通过。流结束或计时结束则失败。" },
          ],
        },
        {
          title: "棋盘操作",
          items: [
            { label: "读取活跃车道", detail: "一次只有一条车道处于活跃状态，队列预览下一个节拍。" },
            { label: "监视中心区", detail: "在计时标记穿过中心区时点击以获得完美或不错。" },
            { label: "保持触摸安全", detail: "所有三个车道按钮都很大且均匀间隔。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Beat Match",
      summary: "Lisez la voie active, attendez que le marqueur de timing traverse la zone centrale, et appuyez sur la voie correspondante pour maintenir le combo.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour armer le flux de rythme." },
            { label: "Construire les coups", detail: "Les appuis parfaits et bons augmentent l'objectif de coup. Les erreurs cassent le combo et font avancer le flux." },
            { label: "Terminer ou échouer", detail: "La manche se termine une fois l'objectif de coup atteint. Si le flux se termine ou que le minuteur expire, la manche échoue." },
          ],
        },
        {
          title: "Contrôles du tableau",
          items: [
            { label: "Lire la voie active", detail: "Une seule voie est active à la fois, et la file d'attente à venir prévisualise les prochains rythmes." },
            { label: "Regarder la zone centrale", detail: "Appuyez tandis que le marqueur de timing traverse la zone centrale pour un coup parfait ou bon." },
            { label: "Rester tactile-sûr", detail: "Les trois boutons de voie restent grands et uniformément espacés." },
          ],
        },
      ],
    },
  },
  "block-tessellate": {
    ja: {
      title: "Block Tessellate の遊び方",
      summary: "落ちてくるピースをうまく配置し、シルエットをすき間なく埋めていきます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のシルエットを読み込み、固定された落下キューで。" },
            { label: "重力下に配置", detail: "すべてのピースが独自のタイマーで落下するため、サイドムーブとローテーションはハードドロップロックの前に発生する必要がある。" },
            { label: "クリアまたは失敗", detail: "タイマー切れの前にセット内のすべてのシルエットを封じる。ミスドロップは現在のシルエットをリセットして結果メトリクスを増加させる。" },
          ],
        },
        {
          title: "配置操作",
          items: [
            { label: "左または右に移動", detail: "レーンボタンを使ってアクティブピースをコンパクトなボード上でスライドさせる。" },
            { label: "ドロップ前に回転", detail: "回転はフットプリントを変更し、エッジがボードの外を超えた場合、内側にクランプし直す。" },
            { label: "ゴーストを読む", detail: "プレビューセルはハードドロップが現在のピースをロックする場所を表示。" },
          ],
        },
      ],
    },
    zh: {
      title: "方块镶嵌控制",
      summary: "引导每个下落的方块，用完整的队列封住轮廓后计时不要到期。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来加载第一个轮廓和固定的下落队列。" },
            { label: "在重力下放置", detail: "每个方块都有自己的计时器落下，所以横向移动和旋转必须在硬drop锁定前发生。" },
            { label: "清除或失败", detail: "在计时结束前封住集合中的每个轮廓。错误放置会重置当前轮廓并提高结果指标。" },
          ],
        },
        {
          title: "放置控制",
          items: [
            { label: "左或右移动", detail: "使用车道按钮在紧凑的棋盘上滑动活跃方块。" },
            { label: "放置前旋转", detail: "旋转改变足迹并在边缘会越过板时将其夹回内部。" },
            { label: "读取幽灵", detail: "预览单元显示硬drop将锁定当前方块的位置。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Block Tessellate",
      summary: "Guidez chaque pièce tombante, obturez l'intégralité de la silhouette avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour charger la première silhouette avec une file d'attente de chute fixe." },
            { label: "Placer sous la gravité", detail: "Chaque pièce tombe selon son propre minuteur, donc les mouvements latéraux et les rotations doivent se produire avant le blocage du drop dur." },
            { label: "Effacer ou échouer", detail: "Obturez chaque silhouette dans l'ensemble avant l'expiration du minuteur. Un mauvais placement réinitialise la silhouette actuelle." },
          ],
        },
        {
          title: "Contrôles de placement",
          items: [
            { label: "Déplacer à gauche ou à droite", detail: "Utilisez les boutons de voie pour faire glisser la pièce active sur le tableau compact." },
            { label: "Faire pivoter avant de lâcher", detail: "La rotation change l'empreinte et la resserre lorsque le bord serait franchi." },
            { label: "Lire le fantôme", detail: "Les cellules d'aperçu montrent où le drop dur verrouillera la pièce actuelle." },
          ],
        },
      ],
    },
  },
  "bounce-angle": {
    ja: {
      title: "Bounce Angle の遊び方",
      summary: "反射角を読んで角度を選び、ボールを狙いのポケットへ跳ね返します。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のリコシェボードを読み込み、目に見えるターゲットポケットとハザードポケット付き。" },
            { label: "選択して発射", detail: "一度に1つのアングルのみアーム。発射は完全なリバウンドをインスタント実行し、次の読みに向けて最後のトレースをボードに残す。" },
            { label: "クリアまたは失敗", detail: "タイマー切れの前にセット内のすべてのボードをクリア。すべての発射がニュートラルポケットに着地するでも結果メトリクスにカウントされる。" },
          ],
        },
        {
          title: "リコシェ操作",
          items: [
            { label: "上部ポケットを読む", detail: "緑色のポケットが目標、コーラルポケットがハザード、残りはニュートラル出口。" },
            { label: "固定アングルパッドを使用", detail: "各パッドは毎回同じ決定論的パスで発射。パズルはドラッグエイムではなく反射計画。" },
            { label: "トレースを監視", detail: "最後の発射は完全なリバウンドラインとバウンスマーカーを残す。" },
          ],
        },
      ],
    },
    zh: {
      title: "弹跳角度控制",
      summary: "选择一个固定角度垫，读取侧墙如何重定向射击，并仅在路径应该落入绿色顶部口袋时发射。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来加载第一个反弹板。" },
            { label: "选择然后发射", detail: "一次只能装备一个角度。发射瞬间解析完整的反弹并在下一次读取中留下轨迹。" },
            { label: "清除或失败", detail: "在计时结束前清除集合中的每个板。即使着陆在中性口袋中，每次发射也会计入结果指标。" },
          ],
        },
        {
          title: "反弹控制",
          items: [
            { label: "读取顶部口袋", detail: "绿色口袋是目标，珊瑚口袋是危险。" },
            { label: "使用固定角度垫", detail: "每个垫每次都发射相同的确定性路径。" },
            { label: "监视轨迹", detail: "最后一次发射留下完整的反弹线。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Bounce Angle",
      summary: "Choisissez un coussin d'angle fixe, lisez comment les murs latéraux redirigeront le tir, et lancez uniquement lorsque la trajectoire devrait atterrir dans la poche verte du haut.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour charger la première planche de ricochet." },
            { label: "Sélectionner puis lancer", detail: "Un seul angle est armé à la fois. Le lancement résout instantanément le rebond complet." },
            { label: "Effacer ou échouer", detail: "Effacez chaque planche dans l'ensemble avant l'expiration du minuteur." },
          ],
        },
        {
          title: "Contrôles de ricochet",
          items: [
            { label: "Lire les poches du haut", detail: "La poche verte est l'objectif, les poches de corail sont des dangers." },
            { label: "Utiliser des coussins d'angle fixe", detail: "Chaque coussinet tire le même chemin déterministe chaque fois." },
            { label: "Regarder la trace", detail: "Le dernier lancement laisse une ligne de rebond complète et des marqueurs de rebond." },
          ],
        },
      ],
    },
  },
  "cascade-flip": {
    ja: {
      title: "Cascade Flip の遊び方",
      summary: "めくられた順番を覚え、流れてくるカードを同じ順でタップして再現します。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初の明示フェーズを開く。" },
            { label: "公開してから追跡", detail: "ターゲット順序が最初に表示され、ライブストリームが行ごとにシフトを開始、入力がアンロック。" },
            { label: "クリアまたは失敗", detail: "タイマー切れの前にフルセットのストリーム全体でターゲットカードを解く。" },
          ],
        },
        {
          title: "ストリーム操作",
          items: [
            { label: "注文ストリップを読む", detail: "解決されたカードは暗くなり、現在のターゲットは強調表示され、今後のカードは表示されたまま。" },
            { label: "ライブカードのみタップ", detail: "ライブストリームのみが入力を受け入れる。" },
            { label: "最後のシフトを使用", detail: "ストリームは固定行ステップで移動する。" },
          ],
        },
      ],
    },
    zh: {
      title: "级联翻转控制",
      summary: "记住显示的卡顺序，然后从移动流中以相同的顺序点击，不让错误堆积。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程打开第一个显示阶段。" },
            { label: "显示然后追踪", detail: "目标顺序首先显示，然后实时流开始按行移位。" },
            { label: "清除或失败", detail: "解决整个流集中的每个目标卡。" },
          ],
        },
        {
          title: "流控制",
          items: [
            { label: "读取顺序条", detail: "已解决的卡变暗，当前目标保持突出显示。" },
            { label: "仅点击实时卡", detail: "只有实时流接受输入。" },
            { label: "使用最后一个班次", detail: "流以固定行步移动。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Cascade Flip",
      summary: "Mémorisez l'ordre de la carte révélée, puis reproduisez le même ordre du flux en mouvement sans laisser les erreurs s'accumuler.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour ouvrir la première phase de révélation." },
            { label: "Révéler puis suivre", detail: "L'ordre cible s'affiche en premier, puis le flux en direct commence à se décaler ligne par ligne." },
            { label: "Effacer ou échouer", detail: "Résolvez chaque carte cible dans l'ensemble complet du flux." },
          ],
        },
        {
          title: "Contrôles de flux",
          items: [
            { label: "Lire la bande de commande", detail: "Les cartes résolues s'assombrissent, la cible actuelle reste en surbrillance." },
            { label: "Ne pas appuyer que sur des cartes actives", detail: "Seul le flux en direct accepte l'entrée." },
            { label: "Utiliser le dernier quart de travail", detail: "Le flux se déplace par étapes de ligne fixes." },
          ],
        },
      ],
    },
  },
  "box-fill": {
    ja: {
      title: "Box Fill の遊び方",
      summary: "ピースを回転させながら正しい場所にはめ込み、箱をきれいに埋めます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初の不規則ボックスを読み込み、固定トレイ付き。" },
            { label: "プレビューしてから配置", detail: "トレイピースをタップ、必要に応じて回転、ボードアンカーをタップしてフィットをプレビュー。" },
            { label: "クリアまたは失敗", detail: "タイマー切れの前にセット内のすべてのボードを終了。無効なフィットはブロックされ、配置エラーを追加。" },
          ],
        },
        {
          title: "パッキング操作",
          items: [
            { label: "トレイから選択", detail: "配置されていないトレイピースのみがアクティブ。" },
            { label: "アンカープレビューを使用", detail: "任意のボード スロットをタップしてプレビューアンカーを設定。" },
            { label: "元に戻すまたはリセット", detail: "元に戻すピース は最後のコミット配置を削除。" },
          ],
        },
      ],
    },
    zh: {
      title: "填充方块控制",
      summary: "一次选择一个托盘方块，将其旋转至正确的足迹，在棋盘上预览锚点，仅在拟合整洁时放置。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来加载第一个不规则的箱体。" },
            { label: "预览然后放置", detail: "点击一个托盘方块，如果需要旋转，点击棋盘上的锚点进行预览。" },
            { label: "清除或失败", detail: "在计时结束前完成集合中的每个棋盘。无效的拟合被阻止。" },
          ],
        },
        {
          title: "打包控制",
          items: [
            { label: "从托盘中选择", detail: "只有未放置的托盘方块保持活跃。" },
            { label: "使用锚点预览", detail: "点击任何棋盘位置设置预览锚点。" },
            { label: "撤消或重置", detail: "撤消方块删除最后的放置。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Box Fill",
      summary: "Choisissez un morceau de plateau à la fois, faites-le pivoter dans la bonne empreinte, prévisualisez l'ancre sur le plateau, et ne placez que si l'ajustement est net.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour charger le premier plateau avec un plateau fixe." },
            { label: "Prévisualiser puis placer", detail: "Appuyez sur une pièce de plateau, faites-la pivoter si nécessaire, appuyez sur une ancre de plateau pour prévisualiser l'ajustement." },
            { label: "Effacer ou échouer", detail: "Terminez chaque plateau de l'ensemble avant l'expiration du minuteur." },
          ],
        },
        {
          title: "Contrôles d'emballage",
          items: [
            { label: "Sélectionner dans le plateau", detail: "Seules les pièces de plateau non placées restent actives." },
            { label: "Utiliser des aperçus d'ancrage", detail: "Appuyez sur une position de plateau pour définir l'ancre d'aperçu." },
            { label: "Annuler ou réinitialiser", detail: "La pièce d'annulation supprime le dernier placement." },
          ],
        },
      ],
    },
  },
  "gap-rush": {
    ja: {
      title: "Gap Rush の遊び方",
      summary: "次の安全なレーンを先読みし、迫る壁のすき間を通り抜け続けます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して固定回廊シーケンスをアーム、最初の開口部表示。" },
            { label: "各ギャップへグライド", detail: "レーンパッドはグライドパスを再ターゲットするが、ランナーはインスタント スナップの代わりに連続ドリフト。" },
            { label: "クリアまたはクラッシュ", detail: "タイマー切れの前にフルウォールセットを生き残る。開口部を外すとクラッシュして即座。" },
          ],
        },
        {
          title: "回廊操作",
          items: [
            { label: "レーンパッドを使用", detail: "各大きなレーンボタンはグライドパスを再ターゲット。" },
            { label: "プレビューを読む", detail: "ライブウォールは現在の開口部を表示、フェードバンドは次のものをプレビュー。" },
            { label: "パーフェクトパスを追求", detail: "パーフェクトクレジットは単に安全ゾーン内ではなく、開口部の中央近くの場合のみ。" },
          ],
        },
      ],
    },
    zh: {
      title: "缝隙冲刺控制",
      summary: "提前设置下一条车道，让跑步者滑过走廊，随着墙的速度增加，停留在每个开口的中心。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来装备一个固定走廊。" },
            { label: "滑入每个缝隙", detail: "车道垫重新定位滑行路径，但跑步者连续漂移而不是即时跳跃。" },
            { label: "清除或碰撞", detail: "在计时结束前幸存完整的墙集。错过开口会立即崩溃。" },
          ],
        },
        {
          title: "走廊控制",
          items: [
            { label: "使用车道垫", detail: "每个大车道按钮重新定位滑行路径。" },
            { label: "读取预览", detail: "实时墙显示当前开口，褪色带预览下一个。" },
            { label: "追求完美通过", detail: "完美信用仅在跑步者靠近开口中心时计数。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Gap Rush",
      summary: "Définissez la prochaine voie dès le début, laissez le coureur glisser dans le couloir, et restez centré dans chaque ouverture lorsque la vitesse du mur augmente.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour armer une séquence de couloir fixe." },
            { label: "Glisser dans chaque brèche", detail: "Les coussins de voie reciblent le chemin de glisse, mais le coureur dérive continuellement au lieu de s'aligner instantanément." },
            { label: "Effacer ou s'écraser", detail: "Survivez à l'ensemble complet des murs avant l'expiration du minuteur. Manquer l'ouverture vaut s'écraser immédiatement." },
          ],
        },
        {
          title: "Contrôles du couloir",
          items: [
            { label: "Utiliser les coussins de voie", detail: "Chaque grand bouton de voie recible le chemin de glisse." },
            { label: "Lire les aperçus", detail: "Le mur en direct montre l'ouverture actuelle, la bande estompée prévisualise la suivante." },
            { label: "Poursuivre les passages parfaits", detail: "Le crédit parfait ne compte que lorsque le coureur est près du centre de l'ouverture." },
          ],
        },
      ],
    },
  },
  "bubble-spawn": {
    ja: {
      title: "Bubble Spawn の遊び方",
      summary: "膨らみ方を見て最適なバブルを割り、メーターが崩れないように保ちます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初の確定的な圧力フィールドを開く。" },
            { label: "圧力下でバースト", detail: "すべてのパルスがフィールドを成長させ、1つのバブルをスポーン。接続またはオーバーサイズのバブルは広いチェーン。" },
            { label: "クリアまたは失敗", detail: "安定メーターが満杯になるとランクリア。飽和がフィールド限界またはタイマー切れに達すると失敗。" },
          ],
        },
        {
          title: "フィールド操作",
          items: [
            { label: "ライブバブルをタップ", detail: "ライブバブルのみがバースト可能。すべてのスロットは大きく保持。" },
            { label: "ベストターゲットを監視", detail: "最も強いバースト ターゲットは概要表示。" },
            { label: "サマリーを読む", detail: "最大の脅威、次のスポーン、最後のチェーン、安定性、飽和が表示。" },
          ],
        },
      ],
    },
    zh: {
      title: "气泡生成控制",
      summary: "读取哪些气泡膨胀最快，在下一个压力脉冲之前爆破最佳目标，并保持饱和和稳定计量器朝正确的方向移动。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程打开第一个确定的压力场。" },
            { label: "在压力下爆破", detail: "每个脉冲都会增加字段并生成一个气泡。连接或超大气泡爆裂较宽的链。" },
            { label: "清除或失败", detail: "当稳定计量器满足时清除。如果饱和达到限制或计时结束则失败。" },
          ],
        },
        {
          title: "字段控制",
          items: [
            { label: "点击实时气泡", detail: "只有实时气泡可以爆裂。每个位置保持很大。" },
            { label: "监视最佳目标", detail: "最强的当前爆破目标有轮廓。" },
            { label: "读取摘要", detail: "最大威胁、下一个生成、最后一条链、稳定性和饱和保持可见。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Bubble Spawn",
      summary: "Lisez quelles bulles gonflent le plus vite, éclatez la meilleure cible avant la prochaine impulsion de pression, et gardez les jauges de saturation et de stabilité bouger dans la bonne direction.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour ouvrir le premier champ de pression déterministe." },
            { label: "Éclater sous pression", detail: "Chaque impulsion fait croître le champ et génère une bulle. Les bulles connectées ou surdimensionnées éclatent en chaînes plus larges." },
            { label: "Effacer ou échouer", detail: "La manche se termine lorsque la jauge de stabilité se remplit. Si la saturation atteint la limite ou que le minuteur expire, la manche échoue." },
          ],
        },
        {
          title: "Contrôles de champ",
          items: [
            { label: "Appuyez sur les bulles actives", detail: "Seules les bulles actives peuvent être éclatées. Chaque emplacement reste grand pour le toucher." },
            { label: "Regarder la meilleure cible", detail: "La cible de rafale actuelle la plus forte est encadrée." },
            { label: "Lire les résumés", detail: "La plus grande menace, la prochaine génération, la dernière chaîne, la stabilité et la saturation restent visibles." },
          ],
        },
      ],
    },
  },
  "cascade-clear": {
    ja: {
      title: "Cascade Clear の遊び方",
      summary: "行か列を起点に連鎖を起こし、どれだけ大きく消せるかを見極めます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押してキュレーションされたコンボボードを読み込み、ターゲットスコア付き。" },
            { label: "トリガーを発火", detail: "各ムーブは1つのフル行または列をクリア、ボードを崩す、固定シーケンスから埋め直す。" },
            { label: "クリアまたは失敗", detail: "トリガー限界またはタイマー切れの前にターゲットスコアに達する。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "行レールを使用", detail: "左側のレールは1行全体を発火。フォールの後に複数の色グループを整列させる時が最適。" },
            { label: "列レールを使用", detail: "上部のレールは1列全体を発火。行トリガーと異なるチェーンパスを開く。" },
            { label: "サマリーを読む", detail: "現在のスコア、スコアゲイン、最高カスケード、最後のトリガーが表示。" },
          ],
        },
      ],
    },
    zh: {
      title: "级联清除控制",
      summary: "发射一行或一列触发器，让棋盘坍塌并重新填充，然后阅读该链中有多少个连接的颜色组爆炸。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来加载一个精选的连击棋盘。" },
            { label: "发射触发器", detail: "每次移动清除一整行或一整列，然后解析器坍塌棋盘并从固定序列重新填充。" },
            { label: "清除或失败", detail: "在触发器限制或计时结束前达到目标分数。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "使用行导轨", detail: "左侧导轨发射整行。当该清除在掉落后线对齐多个颜色组时最佳。" },
            { label: "使用列导轨", detail: "顶部导轨发射整列。可以打开与任何行触发器不同的链路径。" },
            { label: "读取摘要", detail: "当前分数、分数增益、最佳级联和最后触发器保持可见。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Cascade Clear",
      summary: "Déclenchez un déclencheur de ligne ou de colonne, laissez le plateau s'effondrer et se remplir, puis lisez combien de groupes de couleurs connectés explosent de cette chaîne.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour charger un plateau combo sélectionné." },
            { label: "Déclencher un déclencheur", detail: "Chaque coup efface une ligne ou une colonne complète, puis le solutionneur s'effondre et remplit à partir d'une séquence fixe." },
            { label: "Effacer ou échouer", detail: "Atteignez le score cible avant la limite de déclenchement ou l'expiration du minuteur." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Utiliser les rails de ligne", detail: "Le rail du côté gauche déclenche une ligne entière. Meilleur quand ce clair ligne plusieurs groupes de couleurs après la chute." },
            { label: "Utiliser les rails de colonne", detail: "Le rail du haut déclenche une colonne complète. Peut ouvrir un chemin de chaîne différent qu'une ligne." },
            { label: "Lire le résumé", detail: "Le score actuel, le gain de score, la meilleure cascade et le dernier déclencheur restent visibles." },
          ],
        },
      ],
    },
  },
  "chain-trigger": {
    ja: {
      title: "Chain Trigger の遊び方",
      summary: "必要なノードだけを有効にして連鎖を起こし、狙った経路で波を広げます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のグラフパズルを開く。" },
            { label: "ヘルパーをアーム", detail: "各パズルは限られた数の追加トリガーのみ許可。すべているアームノードは意図的なコミットメント。" },
            { label: "発火と調整", detail: "チェーンが停止した場合、ダークノードは表示されたまま、再度発火する前に再度グラフをアームможет。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "閾値を読む", detail: "すべてのノンソースノードは発火する前に必要な受信信号の数を表示。" },
            { label: "タップしてアーム", detail: "任意のノンソースノードをタップしてアーム/ディスアーム。" },
            { label: "チェーンを発火", detail: "チェーン発火を押して確定論的に解析し、各ライトノードをアクティベーション波でスタンプ。" },
          ],
        },
      ],
    },
    zh: {
      title: "链触发控制",
      summary: "读取固定的源节点，仅装备所需的辅助节点，然后发射链并逐波监视传播。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来打开第一个图形谜题。" },
            { label: "装备辅助气体", detail: "每个谜题仅允许少数额外的触发器。每个装备节点都是一个深思熟虑的承诺。" },
            { label: "发射和调整", detail: "如果链停止，暗节点保持可见，在再次发射前可以重新装备图。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "读取阈值", detail: "每个非源节点显示发火前需要多少传入信号。" },
            { label: "点击装备", detail: "点击任何非源节点装备或解装。" },
            { label: "发射链", detail: "按发射链确定论地解析图。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Chain Trigger",
      summary: "Lisez le nœud source fixe, armez uniquement les nœuds d'assistance dont vous avez besoin, puis déclenchez la chaîne et regardez la vague de propagation vague par vague.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour ouvrir le premier puzzle de graphe." },
            { label: "Armer les aides", detail: "Chaque puzzle n'autorise qu'un petit nombre de déclencheurs supplémentaires. Chaque nœud armé est un engagement délibéré." },
            { label: "Tirer et ajuster", detail: "Si la chaîne s'arrête, les nœuds sombres restent visibles et vous pouvez réarmer le graphe avant de le tirer à nouveau." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Lire les seuils", detail: "Chaque nœud non source affiche combien de signaux entrants il a besoin avant de pouvoir tirer." },
            { label: "Appuyez pour armer", detail: "Appuyez sur n'importe quel nœud non source pour l'armer ou le désarmer." },
            { label: "Tirer la chaîne", detail: "Appuyez sur Tirer la chaîne pour résoudre le graphe de manière déterministe." },
          ],
        },
      ],
    },
  },
  "icon-chain": {
    ja: {
      title: "Icon Chain の遊び方",
      summary: "公開された手がかりを頼りに、隠れたアイコンの並びを順番どおりに復元します。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のウォッチフェーズを開く。" },
            { label: "ウォッチしてから推測", detail: "各ラウンドは短いフル順序明示で開始し、手がかりボードと候補トレイをアンロック。" },
            { label: "終了または失敗", detail: "タイマー切れの前にすべての手がかりラウンドをクリア。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "アンカーを読む", detail: "最初と最後のアイコンは手がかりボードに表示され、中央の順序が実際のパズル。" },
            { label: "手がかりカードを使用", detail: "隣接ペア、スロット、ファミリー、前-後の手がかりがチェーンを再構築する間表示。" },
            { label: "次のアイコンをタップ", detail: "次の正しいアイコンのみがチェーンを拡張。間違ったピックはチェーンをアンカー された開始にリセット。" },
          ],
        },
      ],
    },
    zh: {
      title: "图标链控制",
      summary: "记住显示的顺序，保持第一个图标锚定，然后从线索棋盘重建隐藏的链，而不让错误的选择重置进度。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来打开第一个监视阶段。" },
            { label: "监视然后推断", detail: "每次开始时进行短的完整顺序显示，然后解锁线索棋盘和候选托盘。" },
            { label: "完成或失败", detail: "在计时结束前清除每个线索回合。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "读取锚点", detail: "第一个和最后一个图标保持在线索棋盘中可见。" },
            { label: "使用线索卡", detail: "相邻对、位置、家族和前后线索在您重建链时保持可见。" },
            { label: "点击下一个图标", detail: "只有下一个正确的图标扩展链。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Icon Chain",
      summary: "Mémorisez l'ordre révélé, gardez le premier icône ancré, puis reconstruisez la chaîne cachée à partir du plateau d'indices sans laisser les mauvais choix réinitialiser votre progression.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour ouvrir la première phase de regarder." },
            { label: "Regarder puis déduire", detail: "Chaque manche commence par une brève révélation d'ordre complet, puis déverrouille le plateau d'indices et le plateau candidat." },
            { label: "Terminer ou échouer", detail: "Effacez chaque tour d'indice avant l'expiration du minuteur." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Lire les ancres", detail: "Les première et dernière icônes restent visibles dans le plateau d'indices." },
            { label: "Utiliser les cartes d'indice", detail: "Les indices de paire adjacente, d'emplacement, de famille et avant-après restent visibles pendant que vous reconstruisez la chaîne." },
            { label: "Appuyez sur l'icône suivante", detail: "Seule la prochaine icône correcte étend la chaîne." },
          ],
        },
      ],
    },
  },
  "line-connect": {
    ja: {
      title: "Line Connect の遊び方",
      summary: "対応するペア同士を線でつなぎ、線が交差しないように盤面を完成させます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押してルートボードを開く、最初のペアがすでにアーム状態。" },
            { label: "一度に1つのペアを構築", detail: "アクティブなペアのみが独自のターゲットに到達します。そのルートがロックされると、次のペアがすぐにアクティブに。" },
            { label: "クリアまたは失敗", detail: "タイマー切れの前にセット内のすべてのボードを完了。無効なタップ、ペアリセット、ボードリセットはすべてパス補正としてカウント。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "隣接セルをタップ", detail: "次の隣接スロットを タップして各セグメントを拡張。前のスロットをタップしてパスを1ステップバック。" },
            { label: "リセットアクションを使用", detail: "ペアリセットはアクティブルートのみを再開。ボードリセットは現在のパズルをクリア。" },
            { label: "次のセグメントを読む", detail: "ボードはアクティブペア、最後のアクション、非表示の検証ステップを表示。" },
          ],
        },
      ],
    },
    zh: {
      title: "线连接控制",
      summary: "一次扩展活跃对一个线段，让每条路线远离锁定的车道，在计时结束前完成每个紧凑的棋盘。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程打开第一条路线棋盘，第一对已装备。" },
            { label: "一次构建一对", detail: "只有活跃对可以到达其自己的目标。当该路线锁定时，下一对立即变为活跃。" },
            { label: "清除或失败", detail: "在计时结束前完成集合中的每个棋盘。所有无效的点击、对重置和棋盘重置都计为路径纠正。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "点击相邻单元格", detail: "通过点击下一个相邻位置扩展每个线段。点击前一个位置向后退一步。" },
            { label: "使用重置操作", detail: "重置对仅重新启动活跃路线。重置棋盘清除当前谜题。" },
            { label: "读取下一个线段", detail: "棋盘显示活跃对、最后的操作和隐藏的验证步骤。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Line Connect",
      summary: "Étendez la paire active un segment à la fois, gardez chaque itinéraire hors des voies verrouillées, et terminez chaque plateau compact avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour ouvrir le plateau d'itinéraire, la première paire déjà armée." },
            { label: "Construire une paire à la fois", detail: "Seule la paire active peut atteindre sa propre cible. Quand cet itinéraire se verrouille, la paire suivante devient active immédiatement." },
            { label: "Effacer ou échouer", detail: "Terminez chaque plateau de l'ensemble avant l'expiration du minuteur." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Appuyez sur les cellules adjacentes", detail: "Étendez chaque segment en appuyant sur l'emplacement adjacent suivant." },
            { label: "Utiliser les actions de réinitialisation", detail: "Réinitialiser la paire redémarre uniquement l'itinéraire actif. Réinitialiser le plateau efface le puzzle actuel." },
            { label: "Lire le segment suivant", detail: "Le plateau affiche la paire active, l'action dernière et l'étape de vérification masquée." },
          ],
        },
      ],
    },
  },
  "merge-climb": {
    ja: {
      title: "Merge Climb の遊び方",
      summary: "盤面を滑らせて同じ数字をまとめ、より大きな値を作って目標タイルを目指します。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して数字ボードと固定スポーン キューを読み込む。" },
            { label: "ボードを成長させる", detail: "すべての合法的なムーブはタイルをスライド、マッチするペアをコンバイン、新しいスポーンを追加。" },
            { label: "クリアまたは失敗", detail: "タイマー切れの前またはボードが法的ムーブなし状態にロックされる前にゴールタイルに到達。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "方向ボタンを使用", detail: "上、左、下 、または右を押してボード全体をスライド。" },
            { label: "プレッシャーを読む", detail: "サマリーパネルはゴール、最大タイル、次スポーン、空いているセルプレッシャーを表示。" },
            { label: "タッチセーフに保つ", detail: "方向パッドとボード概要は大きく読みやすい。" },
          ],
        },
      ],
    },
    zh: {
      title: "合并爬升控制",
      summary: "将整个棋盘向一个方向滑动，每次移动合并一个匹配值，并保持足够的空白空间到达目标瓷砖。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来加载数字棋盘和固定生成队列。" },
            { label: "增长棋盘", detail: "每次合法的移动都会滑动所有的瓷砖、合并一个匹配对和添加一个新生成。" },
            { label: "清除或失败", detail: "在计时结束前或棋盘锁定在没有合法移动状态前达到目标瓷砖。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "使用方向按钮", detail: "按上、左、下或右让所有瓷砖向那个方向滑动。" },
            { label: "读取压力", detail: "摘要面板保持目标、最大瓷砖、下一个生成和空单元格压力可见。" },
            { label: "保持移动安全", detail: "方向垫和棋盘摘要保持大且易读。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Merge Climb",
      summary: "Faites glisser l'ensemble du plateau dans une seule direction, fusionnez les valeurs correspondantes une fois par coup, et conservez suffisamment d'espace libre pour atteindre la dalle d'objectif.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour charger le plateau numérique et la file d'attente de génération fixe." },
            { label: "Grandir du plateau", detail: "Chaque coup légal fait glisser toutes les tuiles, combine une paire correspondante et ajoute une nouvelle génération." },
            { label: "Effacer ou échouer", detail: "Atteignez la dalle cible avant l'expiration du minuteur ou avant que le plateau se verrouille dans un état sans coup légal." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Utiliser les boutons directionnels", detail: "Appuyez sur Haut, Gauche, Bas ou Droite pour faire glisser toutes les tuiles dans cette direction." },
            { label: "Lire la pression", detail: "Le panneau de résumé garde l'objectif, la tuile maximale, la génération suivante et la pression des cellules vides visibles." },
            { label: "Rester touche-sûr", detail: "Le clavier directionnel et les résumés du plateau restent grands et lisibles." },
          ],
        },
      ],
    },
  },
  "relative-pitch": {
    ja: {
      title: "Relative Pitch の遊び方",
      summary: "基準の音程を聞き取り、新しい基音から同じ音の幅になる選択肢を選びます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押してブラウザオーディオをアンロック、最初のリファレンス音程を再生。" },
            { label: "リッスンして選ぶ", detail: "各ラウンドはリファレンスジャンプを再生、新しいベースノート、候補パッドのみアンロック。" },
            { label: "クリアまたは失敗", detail: "タイマー切れの前にすべてのオーディオラウンドを完了。追加リプレイは結果概要に表示。" },
          ],
        },
        {
          title: "オーディオ操作",
          items: [
            { label: "リファレンスを再生", detail: "別の比較が必要な場合、リファレンスリプレイを使用して元のアンカー-ターゲットジャンプをもう一度聞く。" },
            { label: "ベースを再生", detail: "候補をコミットする前に、ベースリプレイを使用して新しいベースノートのみを聞く。" },
            { label: "1つのパッドを選ぶ", detail: "各候補パッドは新しいベース+答えノートを再生、すぐにそのラウンドの選択をロック。" },
          ],
        },
      ],
    },
    zh: {
      title: "相对音高控制",
      summary: "听参考音程，听新基础音，然后选择从该新基础重新创建相同跳跃的候选。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程以解锁浏览器音频并播放第一个参考音程。" },
            { label: "听然后选择", detail: "每进行播放参考跳跃、新基础音和候选垫。" },
            { label: "清除或失败", detail: "在计时结束前完成每个音频回合。额外重放在结果摘要中可见。" },
          ],
        },
        {
          title: "音频控制",
          items: [
            { label: "重放参考音", detail: "需要另一个比较时使用重放参考音再听原始跳跃。" },
            { label: "重放基础音", detail: "在提交候选前使用重放基础音只听新基础音。" },
            { label: "选择一个垫", detail: "每个候选垫播放新基础加答案音并立即锁定该选择。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Relative Pitch",
      summary: "Écoutez l'intervalle de référence, entendez la nouvelle note de base, puis choisissez le candidat qui recréerait le même saut à partir de cette nouvelle base.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour déverrouiller l'audio du navigateur et lire l'intervalle de référence." },
            { label: "Écouter puis choisir", detail: "Chaque manche joue le saut de référence, puis la nouvelle note de base, et seulement alors déverrouille les coussins candidats." },
            { label: "Effacer ou échouer", detail: "Terminez chaque manche audio avant l'expiration du minuteur." },
          ],
        },
        {
          title: "Contrôles audio",
          items: [
            { label: "Relire la référence", detail: "Utilisez Relire la référence pour réentendre le saut d'ancrage-cible original quand vous en avez besoin." },
            { label: "Relire la base", detail: "Utilisez Relire la base pour réentendre uniquement la nouvelle note de base avant de valider un candidat." },
            { label: "Choisir un coussinet", detail: "Chaque coussinet candidat joue la nouvelle base plus sa note réponse et verrouille immédiatement ce choix." },
          ],
        },
      ],
    },
  },
  "color-sweep": {
    ja: {
      title: "Color Sweep の遊び方",
      summary: "指定された色のタイルだけを素早くタップし、時間内にすべて消します。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押してボードをランダム化、タイマーをアーム。" },
            { label: "クリア", detail: "時間制限の前にターゲット色と一致するすべてのタイルをタップ。自動的に結果スクリーンを開く。" },
            { label: "タイムアウト", detail: "タイマーが終了した時にターゲットタイルが残る場合、ランはクリアなしとして保存、結果スクリーンを自動的に開く。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "ターゲットを読む", detail: "ターゲット色はボード上とステータスチップに表示。" },
            { label: "慎重にタップ", detail: "正しいターゲットタイルは消失。間違ったタップはサポートメトリクスを増加させるがランを停止しない。" },
            { label: "モバイルセーフに保つ", detail: "すべてのタイルは1級タップターゲット。" },
          ],
        },
      ],
    },
    zh: {
      title: "颜色扫描控制",
      summary: "找到目标颜色，仅点击那些瓷砖，并在计时到期前清除整个集合。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来随机化棋盘并启动计时。" },
            { label: "清除", detail: "在时间限制前点击与目标颜色匹配的每个瓷砖。结果屏幕自动打开。" },
            { label: "超时", detail: "如果计时结束时任何目标瓷砖仍然存在，则ランクリアなし状态保存，并自动打开结果屏幕。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "读取目标", detail: "目标颜色显示在棋盘上方和状态芯片中。" },
            { label: "仔细点击", detail: "正确的目标瓷砖消失。错误的点击增加支持指标但不停止ラン。" },
            { label: "保持移动安全", detail: "每个瓷砖都是第一类点击目标。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Color Sweep",
      summary: "Trouvez la couleur cible, n'appuyez que sur ces tuiles, et effacez l'ensemble complet avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour randomiser le plateau et armer le minuteur." },
            { label: "Effacer", detail: "Appuyez sur chaque tuile correspondant à la couleur cible avant le délai imparti. L'écran de résultat s'ouvre automatiquement." },
            { label: "Timeout", detail: "Si des tuiles cibles restent à la fin du minuteur, la manche est enregistrée comme non effacée et l'écran de résultat s'ouvre automatiquement." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Lire la cible", detail: "La couleur cible s'affiche au-dessus du plateau et dans les puces d'état." },
            { label: "Appuyez avec précaution", detail: "Les tuiles cibles correctes disparaissent. Les appuis incorrects augmentent la métrique de soutien." },
            { label: "Rester mobile-sûr", detail: "Chaque tuile est une cible d'appui de première classe." },
          ],
        },
      ],
    },
  },
  "color-census": {
    ja: {
      title: "Color Census の遊び方",
      summary: "一瞬だけ見える色の配置を覚え、消えたあとに色の数や最多色を答えます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のウォッチフェーズを開く。" },
            { label: "ウォッチして答える", detail: "各ラウンドは短いモザイク表示で開始、多数またはカウント正確クエリをアンロック。" },
            { label: "タイムアウト", detail: "スプリント全体の前にタイマーが切れると、ランはクリアなしとして保存、結果スクリーン自動的に開く。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "スプレッドを暗記", detail: "ライブモザイクはウォッチフェーズのみに表示。フェードするとメモリから答える。" },
            { label: "クエリを読む", detail: "いくつかのラウンドは最も見える色を質問。他はいくつのタイルが1色使用を質問。" },
            { label: "ミスを読む", detail: "間違った答えは誤りカウント増加、ラウンドは正答まで維持。" },
          ],
        },
      ],
    },
    zh: {
      title: "颜色人口普查控制",
      summary: "在马赛克可见时记住它，然后在计时之前从内存中回答颜色分布查询。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程打开第一个监视阶段。" },
            { label: "监视然后回答", detail: "每进行都以简短的马赛克显示开始，然后解锁多数或精确计数问题。" },
            { label: "超时", detail: "如果计时在整个冲刺前到期，则ランクリアなし状态保存，结果屏幕自动打开。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "记住分布", detail: "实时马赛克仅在监视阶段可见。褪去后从内存中回答。" },
            { label: "读取查询", detail: "有些ラウンド问哪个颜色最多。其他问有多少个瓷砖用了一个颜色。" },
            { label: "读取错误", detail: "错误答题增加错误计数但ラウンド保持活跃直到正答被选中。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Color Census",
      summary: "Mémorisez la mosaïque pendant qu'elle est visible, puis répondez à la requête de distribution des couleurs de mémoire avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour ouvrir la première phase de regarder." },
            { label: "Regarder puis répondre", detail: "Chaque manche commence par une brève révélation de mosaïque et déverrouille alors une question de majorité ou de compte exact." },
            { label: "Timeout", detail: "Si le minuteur expire avant que le sprint complet soit répondu, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Mémoriser la répartition", detail: "La mosaïque en direct n'est visible que pendant la phase de regarder." },
            { label: "Lire la requête", detail: "Certains tours demandent quelle couleur s'est produite le plus. D'autres demandent combien de tuiles utilisaient une couleur." },
            { label: "Lire les erreurs", detail: "Les mauvaises réponses augmentent le compte d'erreurs mais le tour reste actif." },
          ],
        },
      ],
    },
  },
  "flip-match": {
    ja: {
      title: "Flip Match の遊び方",
      summary: "カードを反転させて向きをそろえ、目標パターンと一致する形に整えます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のターゲットとライブボードペアを読み込む。" },
            { label: "ラウンドをクリア", detail: "各解決ボードは自動的に次のラウンドを開く、スプリント完全になるまで。" },
            { label: "タイムアウト", detail: "タイマーが切れると、ランはクリアなしとして保存、結果スクリーン自動的に開く。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "ルールを読む", detail: "各タップは選択したタイルとその直左右の隣人をフリップ。" },
            { label: "ターゲットにマッチ", detail: "ライブボードのみインタラクティブ。ラウンドはすぐにクリア。" },
            { label: "フリップを読む", detail: "すべてのタップはフリップメトリクスにカウント。" },
          ],
        },
      ],
    },
    zh: {
      title: "翻转匹配控制",
      summary: "读取目标轮廓，翻转实时卡，使用水平翻转规则匹配冲刺内的每个棋盘。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来加载第一个目标和实时棋盘对。" },
            { label: "清除回合", detail: "每个解决的棋盘自动打开下一个ラウンド直到完整冲刺完成。" },
            { label: "超时", detail: "如果计时在每个ラウンド前到期，ランクリアなし状态保存，结果屏幕自动打开。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "读取规则", detail: "每个点击翻转所选瓷砖及其直左右邻居。" },
            { label: "匹配目标", detail: "只有实时棋盘是交互式的。ラウンド因瞬间匹配而清除。" },
            { label: "读取翻转数", detail: "每个点击都计入翻转指标。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Flip Match",
      summary: "Lisez la silhouette cible, retournez les cartes en direct, et utilisez la règle de bande horizontale pour faire correspondre chaque plateau du sprint.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour charger la première paire cible et plateau en direct." },
            { label: "Effacer les tours", detail: "Chaque plateau résolu ouvre le tour suivant automatiquement jusqu'à la fin du sprint." },
            { label: "Timeout", detail: "Si le minuteur expire avant que tous les tours ne soient résolus, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Lire la règle", detail: "Chaque appui retourne la tuile sélectionnée et ses voisins gauche et droit immédiats." },
            { label: "Correspondre à la cible", detail: "Seul le plateau en direct est interactif. Le tour s'efface dès que son motif correspond à la silhouette cible." },
            { label: "Lire les retournements", detail: "Chaque appui compte pour la métrique de retournement." },
          ],
        },
      ],
    },
  },
  "rotate-align": {
    ja: {
      title: "Rotate Align の遊び方",
      summary: "タイルを回して道をつなぎ、スタートからゴールまでの通路を完成させます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のルートボードを読み込む。" },
            { label: "ラウンドをクリア", detail: "各解決ルートは直接次ラウンドに進む、スプリント完全になるまで。" },
            { label: "タイムアウト", detail: "タイマーが切れると、ランはクリアなしとして保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "1つのタイルを回転", detail: "任意のルートタイルをタップして時計回りに90度回転。" },
            { label: "パスを読む", detail: "開始マーカーから終了マーカーまでのスムーズなラインで ルートがクリア。" },
            { label: "回転を読む", detail: "毎回のタイル回転は回転メトリクスを増加。" },
          ],
        },
      ],
    },
    zh: {
      title: "旋转对齐控制",
      summary: "旋转路线瓷砖，从开始重新连接路径到结束，在计时到期前清除冲刺内的每个棋盘。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来加载第一条路线棋盘。" },
            { label: "清除回合", detail: "每个解决的路线直接推进到下一个ラウンド直到完整冲刺完成。" },
            { label: "超时", detail: "如果计时在每个路线前到期时，ランクリアなし状态保存。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "旋转一个瓷砖", detail: "点击任何路线瓷砖顺时针旋转90度。" },
            { label: "读取路径", detail: "路线仅当行从开始标记到结束标记时清除。" },
            { label: "读取旋转数", detail: "每个瓷砖翻转增加旋转指标。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Rotate Align",
      summary: "Faites pivoter les tuiles d'itinéraire, reconnectez le chemin du début à la fin, et effacez chaque plateau du sprint avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour charger le premier plateau d'itinéraire." },
            { label: "Effacer les tours", detail: "Chaque itinéraire résolu avance directement au tour suivant jusqu'à la fin du sprint." },
            { label: "Timeout", detail: "Si le minuteur expire avant que chaque itinéraire ne soit résolu, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Faire pivoter une tuile", detail: "Appuyez sur n'importe quelle tuile d'itinéraire pour la faire pivoter de 90 degrés dans le sens des aiguilles d'une montre." },
            { label: "Lire le chemin", detail: "L'itinéraire s'efface uniquement lorsque la ligne s'exécute proprement du marqueur de début au marqueur de fin." },
            { label: "Lire les rotations", detail: "Chaque rotation de tuile augmente la métrique de rotation." },
          ],
        },
      ],
    },
  },
  "position-lock": {
    ja: {
      title: "Position Lock の遊び方",
      summary: "トークンが止まった位置を覚え、あとから正しいマスへ戻していきます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のウォッチフェーズを開く。" },
            { label: "ウォッチして配置", detail: "各ラウンドはトークン移動を短く表示、ボードを空白化、トークントレイを配置用にアンロック。" },
            { label: "ラウンド レビュー", detail: "すべてのトークン配置の後、ボードは正確、ニア、ミスした配置を強調。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "1つのトークンを選択", detail: "トレイ内のトークンをタップしてアーム配置のため。" },
            { label: "慎重に配置", detail: "そのトークンの覚えているボード セルをタップ。占有セルは別のトークンを受け入れません。" },
            { label: "レビューを読む", detail: "正確な配置は緑色に光り、ニア配置はアンバー。非正確配置はサポートメトリクスを増加。" },
          ],
        },
      ],
    },
    zh: {
      title: "位置锁定控制",
      summary: "监视令牌降落到棋盘上，然后在计时到期前将每个标签放回其记住的最终单元格。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程打开第一个监视阶段。" },
            { label: "监视然后放置", detail: "每进行都显示移动令牌简短，空白棋盘，解锁放置令牌托盘。" },
            { label: "ラウンド审查", detail: "每个令牌放置后，棋盘突显精确、近-近和错过的放置。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "选择一个令牌", detail: "点击托盘中的令牌以装备放置。" },
            { label: "小心放置", detail: "点击该令牌的记住棋盘单元格。占用的单元格不接受另一个令牌。" },
            { label: "读取审查", detail: "精确放置发光绿色，近放置发光琥珀色。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Position Lock",
      summary: "Regardez les jetons se déposer sur le plateau, puis replacez chaque étiquette dans sa cellule finale mémorisée avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour ouvrir la première phase de regarder." },
            { label: "Regarder puis placer", detail: "Chaque manche montre les jetons en mouvement brièvement, puis efface le plateau et déverrouille le plateau de jetons pour placement." },
            { label: "Examen des tours", detail: "Après que chaque jeton soit placé, le plateau met en surbrillance les placements exacts, proches et manqués." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Sélectionner un jeton", detail: "Appuyez sur un jeton dans le plateau pour l'armer pour placement." },
            { label: "Placer avec précaution", detail: "Appuyez sur la cellule du plateau mémorisée pour ce jeton. Les cellules occupées n'acceptent pas un autre jeton." },
            { label: "Lire l'examen", detail: "Les placements exacts brillent en vert, les placements proches brillent en ambre." },
          ],
        },
      ],
    },
  },
  "tap-safe": {
    ja: {
      title: "Tap Safe の遊び方",
      summary: "安全なターゲットだけを素早くタップし、危険物を避けながらノルマを達成します。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のウェーブをスポーン。" },
            { label: "ゴールをクリア", detail: "各セーフターゲットタップはゴール進行を増加。目標に達すると、結果スクリーン自動的に開く。" },
            { label: "ウェーブプレッシャー", detail: "ハザードタップは大きなペナルティを追加。ウェーブ更新の背後に残すセーフターゲットは小さなペナルティ。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "SAFEバッジを読む", detail: "セーフターゲットは常にクリアなSAFE、OK、またはGOバッジを表示。" },
            { label: "ハザードを無視", detail: "ハザードオブジェクトはNO、HAZ、またはRISKバッジを使用。タップすべきでない。" },
            { label: "モバイルセーフに保つ", detail: "すべてのウェーブセルは1級タップターゲット。" },
          ],
        },
      ],
    },
    zh: {
      title: "点击安全控制",
      summary: "过滤每个简短的波，仅点击安全目标，避免危险物体，同时朝移动目标冲刺。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来生成第一个波。" },
            { label: "清除目标", detail: "每个安全目标点击都增加目标进度。到达目标时，结果屏幕自动打开。" },
            { label: "波压力", detail: "危险点击添加大的惩罚。在波刷新时落在背后的安全目标添加小的惩罚。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "读取SAFE徽章", detail: "安全目标总是显示明确的SAFE、OK或GO徽章。" },
            { label: "忽略危险物体", detail: "危险物体使用NO、HAZ或RISK徽章，永远不应该点击。" },
            { label: "保持移动安全", detail: "每个波单元格都是第一类点击目标。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Tap Safe",
      summary: "Filtrez chaque courte vague, n'appuyez que sur les cibles sûres, et évitez les objets dangereux tout en vous dirigeant vers l'objectif de coup.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour générer la première vague." },
            { label: "Effacer l'objectif", detail: "Chaque appui sur cible sûre augmente la progression de l'objectif. Lorsque l'objectif est atteint, l'écran de résultat s'ouvre automatiquement." },
            { label: "Pression des vagues", detail: "Les appuis sur danger ajoutent une pénalité importante. Les cibles sûres laissées pour compte lors de l'actualisation des vagues ajoutent une petite pénalité." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Lire les badges SAFE", detail: "Les cibles sûres affichent toujours des badges SAFE, OK ou GO clairs." },
            { label: "Ignorer les dangers", detail: "Les objets de danger utilisent les badges NO, HAZ ou RISK et ne doivent jamais être cliqués." },
            { label: "Rester mobile-sûr", detail: "Chaque cellule d'onde est une cible d'appui de première classe." },
          ],
        },
      ],
    },
  },
  "spinner-aim": {
    ja: {
      title: "Spinner Aim の遊び方",
      summary: "回転する照準を見て、危険帯を避けながら狙いどおりにショットを放ちます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押してランチャーと最初のターゲットアークをアーム。" },
            { label: "ショットを発射", detail: "各ターゲットヒットはゴールを進める、次のターゲットとハザードアレンジメントを開く。" },
            { label: "ペナルティを読む", detail: "ハザードヒットとオフターゲットショットの両方は悪いショットとしてカウント。タイマーは実行し続ける。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "アークを読む", detail: "緑色のアークは唯一の安全ウィンドウ。コーラルアークはハザード、ヒットすべきでない。" },
            { label: "一度に発射", detail: "ボードをタップ一度に現在のランチャーアングルをショットとしてコミット。" },
            { label: "モバイルセーフに保つ", detail: "フルランチャーボードは単一のタッチターゲット。" },
          ],
        },
      ],
    },
    zh: {
      title: "微调瞄准控制",
      summary: "监视启动器旋转，通过目标弧发射，避免危险弧同时追逐移动目标。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来装备启动器和第一个目标弧。" },
            { label: "发射射击", detail: "每个目标命中都推进目标并打开下一个目标和危险安排。" },
            { label: "读取惩罚", detail: "危险命中和脱靶射击都算作坏射击，计时继续运行。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "读取弧", detail: "绿色弧是唯一安全窗口。珊瑚弧是危险，永远不应该命中。" },
            { label: "发射一次", detail: "点击棋盘一次来提交当前启动器角度作为射击。" },
            { label: "保持移动安全", detail: "完整的启动器棋盘是单一触摸目标。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Spinner Aim",
      summary: "Regardez le lanceur tourner, tirez uniquement à travers l'arc cible, et évitez l'arc de danger tout en poursuivant l'objectif de coup.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour armer le lanceur et le premier arc cible." },
            { label: "Tirer des coups", detail: "Chaque coup cible fait avancer l'objectif et ouvre le prochain arrangement cible et de danger." },
            { label: "Lire les pénalités", detail: "Les coups de danger et les coups hors cible sont tous deux considérés comme des mauvais coups tandis que le minuteur continue de fonctionner." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Lire les arcs", detail: "L'arc vert est la seule fenêtre sûre. L'arc de corail est un danger et ne devrait jamais être frappé." },
            { label: "Tirer une fois", detail: "Appuyez sur le plateau une fois pour valider l'angle de lanceur actuel comme un coup." },
            { label: "Rester mobile-sûr", detail: "Le plateau de lanceur complet est une seule cible tactile." },
          ],
        },
      ],
    },
  },
  "phase-lock": {
    ja: {
      title: "Phase Lock の遊び方",
      summary: "回転する帯を見て、指定ゾーンに入った瞬間に順番どおりロックします。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押してフルホイールスタックをアーム。" },
            { label: "順序でロック", detail: "強調表示されたホイールのみアクティブ。クリーンなロックは次のホイールにすぐに進む。" },
            { label: "ミスを読む", detail: "ミスタイムド ロックはタイミングエラーを追加、ランを停止しない。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "ターゲットバンドを読む", detail: "各ホイールはリムの近く緑色ターゲットバンドを表示。アクティブホイールは、マーカーがそのバンドを横切る間にロック。" },
            { label: "1つのトリガーを使用", detail: "現在のホイールをロック一度押してそれを凍結。" },
            { label: "モバイルセーフに保つ", detail: "トリガーボタンは大きくクリア。" },
          ],
        },
      ],
    },
    zh: {
      title: "阶段锁定控制",
      summary: "监视旋转的轮毂堆栈，将突出显示的轮毂仅锁定在其目标频带内，在计时到期前完成整个序列。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来装备完整的轮毂堆栈。" },
            { label: "按顺序锁定", detail: "只有突出显示的轮毂为活动。清洁锁定立即推进到下一个轮毂。" },
            { label: "读取错误", detail: "计时错误的锁定添加计时错误但不停止ラン。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "读取目标频带", detail: "每个轮毂在轮毂边缘附近显示绿色目标频带。活跃的轮毂必须在其标记穿过该频带时锁定。" },
            { label: "使用一个触发器", detail: "按锁定当前轮毂一次冻结强调的轮毂。" },
            { label: "保持移动安全", detail: "触发按钮保持大且清晰。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Phase Lock",
      summary: "Regardez la pile de roues rotatives, verrouillez la roue en surbrillance uniquement dans sa bande cible, et terminez la séquence complète avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour armer la pile de roues complète." },
            { label: "Verrouiller dans l'ordre", detail: "Seule la roue en surbrillance est active. Un verrouillage net avance directement à la roue suivante." },
            { label: "Lire les erreurs", detail: "Les verrouillages mal temporisés ajoutent des erreurs d'horodatage mais n'arrêtent pas la manche." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Lire la bande cible", detail: "Chaque roue affiche une bande cible verte près de la jante. La roue active doit être verrouillée tandis que son marqueur traverse cette bande." },
            { label: "Utiliser un déclenchement", detail: "Appuyez sur Verrouiller la roue actuelle une fois pour geler la roue en surbrillance." },
            { label: "Rester mobile-sûr", detail: "Le bouton de déclenchement reste grand et clair." },
          ],
        },
      ],
    },
  },
  "sync-pulse": {
    ja: {
      title: "Sync Pulse の遊び方",
      summary: "2つのリングがぴったり重なる瞬間を見極めてタップします。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のパルスウェーブをアーム。" },
            { label: "ウェーブを進める", detail: "パーフェクト とグッドシンクタップの両方が現在ウェーブをクリア、次へ直接移動。" },
            { label: "ミスを読む", detail: "ミスは ランを停止しない、同じウェーブが活動し続ける。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "両方のリングを監視", detail: "パルスAとパルスBは異なる速度で拡張・収縮。重なりウィンドウを掴む。" },
            { label: "1つのシンクパッドをタップ", detail: "大きな中央パッドを使ってパルス重なりを判断、シンクをコミット。" },
            { label: "判定を読む", detail: "ボードはパーフェクト、グッド、またはミスを即座に報告。" },
          ],
        },
      ],
    },
    zh: {
      title: "同步脉冲控制",
      summary: "读取双脉冲节奏，在两个环紧密重叠时点击，在计时到期前链接每个波。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来装备第一个脉冲波。" },
            { label: "推进波", detail: "完美和不错的同步点击都清除当前波并直接移动到下一个。" },
            { label: "读取错误", detail: "错误不停止ラン，同一波保持活跃。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "监视两个环", detail: "脉冲A和脉冲B以不同速率扩展和收缩。覆盖窗口持续漂移。" },
            { label: "点击一个同步垫", detail: "使用大型中央垫来判断当前脉冲重叠和提交同步。" },
            { label: "读取判定", detail: "棋盘完美、不错或错误立即报告。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Sync Pulse",
      summary: "Lisez le rythme de double pulsation, appuyez tandis que les deux anneaux se chevauchent étroitement, et chaînez chaque vague avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour armer la première vague de pulsation." },
            { label: "Avancer les vagues", detail: "Les appuis de synchronisation parfaits et bons effacent la vague actuelle et se déplacent directement au suivant." },
            { label: "Lire les erreurs", detail: "Les erreurs n'arrêtent pas la manche, la même vague reste active." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Regarder les deux anneaux", detail: "L'impulsion A et l'impulsion B se dilatent et se contractent à des rythmes différents. La fenêtre de chevauchement continue de dériver." },
            { label: "Appuyez sur un coussinet de synchronisation", detail: "Utilisez le grand coussin central pour juger la pulsation actuelle et valider la synchronisation." },
            { label: "Lire le jugement", detail: "Le plateau signale parfait, bon ou manqué immédiatement." },
          ],
        },
      ],
    },
  },
  "glow-cycle": {
    ja: {
      title: "Glow Cycle の遊び方",
      summary: "ノードの光り方を見て、合図のタイミングで狙ったノードだけをタップします。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のターゲットサイクルをライト。" },
            { label: "各サイクルをクリア", detail: "正しいターゲットタップは即座に次のターゲット進む。" },
            { label: "ミスタイム から回復", detail: "間違ったノードタップとオフシンクタップはミスタイムカウント追加。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "ターゲットを読む", detail: "1つのノードのみが強調表示 ターゲット。他のノードはデコイだが、タップを受け入れる。" },
            { label: "シンクメーターを監視", detail: "共有メーターを使ってボード全体がグロー クレストに近い時を判定。" },
            { label: "タッチセーフに保つ", detail: "ノードグリッドは大きなボタンと間隔を保つ。" },
          ],
        },
      ],
    },
    zh: {
      title: "发光周期控制",
      summary: "监视脉冲节点一起呼吸，然后仅在棋盘进入共享同步窗口时点击突出显示的目标节点。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来点亮第一个目标周期。" },
            { label: "清除每个周期", detail: "正确的目标点击立即推进到下一个目标和脉冲模式。" },
            { label: "从计时错误恢复", detail: "错误的节点点击和脱同步点击添加到计时错误计数。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "读取目标", detail: "仅一个节点突出显示为活跃目标。其他节点是诱饵但仍接受点击。" },
            { label: "监视同步计量器", detail: "使用共享计量器判断整个棋盘何时靠近发光峰值。" },
            { label: "保持触摸安全", detail: "节点网格保持大的按钮和间距。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Glow Cycle",
      summary: "Observez les nœuds de pulsation respirer ensemble, puis appuyez uniquement sur le nœud cible en surbrillance tandis que le plateau entre dans la fenêtre de synchronisation partagée.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour allumer le premier cycle cible." },
            { label: "Effacer chaque cycle", detail: "Un appui de cible correct avance immédiatement au cible et motif de pulsation suivants." },
            { label: "Récupérer des erreurs de synchronisation", detail: "Les appuis de nœud incorrects et les appuis hors synchronisation ajoutent au compteur d'erreurs de synchronisation." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Lire la cible", detail: "Un seul nœud est en surbrillance en tant que cible en direct. Les autres nœuds sont des leurres qui acceptent toujours les robinets." },
            { label: "Regarder la jauge de synchronisation", detail: "Utilisez la jauge partagée pour juger quand l'ensemble du plateau est près de la crête de luminescence." },
            { label: "Rester tactile-sûr", detail: "La grille de nœud garde les grands boutons et l'espacement." },
          ],
        },
      ],
    },
  },
  "tempo-hold": {
    ja: {
      title: "Tempo Hold の遊び方",
      summary: "指定された長さだけ押し続け、ちょうどよいタイミングで離します。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のターゲット保持期間を明かす。" },
            { label: "各ラウンドをリリース", detail: "すべてのリリースは現在ラウンドをパーフェクト、グッド、またはミスとして解析。" },
            { label: "ミスを読む", detail: "ミスは前進してもラウンド、タイマーはプレッシャーのままです。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "押して保つ", detail: "中央パッドを保ってターゲットゾーンに向かってメーターを成長させる。" },
            { label: "テンポでリリース", detail: "明るいターゲットゾーンに座っている間 に離す。" },
            { label: "メーターを読む", detail: "メーターはフル保持範囲、より広いターゲットゾーン、そしてより狭いパーフェクトゾーンを同時に表示。" },
          ],
        },
      ],
    },
    zh: {
      title: "节奏保持控制",
      summary: "读取目标保持持续时间，按下并保持垫，然后在目标区域内释放时表，实在计时前到期。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来显示第一个目标保持持续时间。" },
            { label: "释放每个ラウンド", detail: "每次释放都将当前ラウンド解析为完美、不错或错误。" },
            { label: "读取错误", detail: "错误仍然推进ラウンド，计时保持压力。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "按下并持有", detail: "按住中央垫将计量器增长到目标区域。" },
            { label: "在节奏时释放", detail: "在计量器在明亮的目标区域中时释放。" },
            { label: "读取计量器", detail: "计量器同时显示完整保持范围、更宽的目标区域和更窄的完美区域。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Tempo Hold",
      summary: "Lisez la durée de maintien cible, appuyez et maintenez le coussin, puis relâchez à l'intérieur de la zone cible avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour révéler la première durée de maintien cible." },
            { label: "Relâcher chaque tour", detail: "Chaque relâchement résout le tour actuel comme parfait, bon ou manqué et charge immédiatement le cible suivant." },
            { label: "Lire les erreurs", detail: "Les erreurs font toujours avancer le tour, le minuteur reste la vraie pression." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Appuyer et maintenir", detail: "Maintenez le coussin central pour agrandir le compteur vers la zone cible." },
            { label: "Relâcher sur tempo", detail: "Laissez aller tandis que le compteur s'assoit dans la zone cible lumineuse." },
            { label: "Lire le compteur", detail: "Le compteur affiche la plage de maintien complète, la zone cible plus large et la zone parfaite plus étroite en même temps." },
          ],
        },
      ],
    },
  },
  "tempo-weave": {
    ja: {
      title: "Tempo Weave の遊び方",
      summary: "2本のレーンを同時に見て、マーカーが中央を通る瞬間だけ正確にタップします。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して両方のスレッド同時にアーム。" },
            { label: "注意を分割", detail: "各レーンは独自のテンポで進む。1つの成功は他のレーンを暫停させない。" },
            { label: "密度を上げる", detail: "ロングストリークは次サイクルを短縮し、プレッシャーを上げる。" },
          ],
        },
        {
          title: "レーン操作",
          items: [
            { label: "ターゲットゾーンを読む", detail: "マーカーがセンターバンドと重なる間のみヒット。パーフェクトはグッドより狭い。" },
            { label: "ミスを監視", detail: "レイトタップとアンプレスドビート両方がミスとしてカウント、ストリークをリセット。" },
            { label: "両方のレーンをクリア", detail: "ランクリアは両方のレーンヒット目標完了後のみ。" },
          ],
        },
      ],
    },
    zh: {
      title: "节奏织法控制",
      summary: "同时监视两个车道标记，并仅在其标记穿过中心目标区时点击每个车道。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来同时装备两个车道。" },
            { label: "分割注意力", detail: "每个车道在其自己的节奏上推进。一个成功从不暂停另一个车道。" },
            { label: "提高密度", detail: "长条纹缩短下一个周期在两条车道上提高压力。" },
          ],
        },
        {
          title: "车道控制",
          items: [
            { label: "读取目标区", detail: "仅在标记与中心带重叠时命中。完美比不错更紧。" },
            { label: "观察错误", detail: "迟到的点击和未按下的节拍都算作错误并重置条纹。" },
            { label: "清除两条车道", detail: "仅在两条车道命中目标完成后ラン清除。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Tempo Weave",
      summary: "Regardez les deux marqueurs de voie à la fois et appuyez sur chaque voie uniquement tandis que son marqueur traverse la zone cible centrale.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour armer les deux voies en même temps." },
            { label: "Diviser l'attention", detail: "Chaque voie avance à son propre tempo, donc un succès ne met jamais en pause l'autre voie." },
            { label: "Augmenter la densité", detail: "Les longues séries raccourcissent le prochain cycle sur les deux voies et augmentent la pression." },
          ],
        },
        {
          title: "Contrôles de voie",
          items: [
            { label: "Lire la zone cible", detail: "Frappez uniquement tandis que le marqueur chevauche la bande centrale. Parfait est plus étroit que bon." },
            { label: "Regarder les erreurs", detail: "Les appuis tardifs et les battements non appuyés sont tous deux comptabilisés comme des erreurs et réinitialisent la séquence." },
            { label: "Effacer les deux voies", detail: "La manche ne s'efface qu'après la fin des deux objectifs de coup de voie." },
          ],
        },
      ],
    },
  },
  "precision-drop": {
    ja: {
      title: "Precision Drop の遊び方",
      summary: "落下のタイミングを見て止め、狙ったラインにできるだけ正確に合わせます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押してランダムな高さから新しいボールをドロップ。" },
            { label: "ヒット", detail: "ボール線と重なる時にレーン内をタップ。結果スクリーンはヒット後自動的に開く。" },
            { label: "ミス", detail: "ボールがヒットランド前にレーン越えドロップ場合、ランはミスとして記録、ランキングから除外。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "スコアにタップ", detail: "レーンは活動中ランの間1つのクリック/タップを受け入れ。" },
            { label: "スコアを読む", detail: "ヒットオフセットが小さいほど結果は良好、ボール速さが早くなっても。" },
            { label: "ミス処理", detail: "ボール越えラインドロップ場合、ランはミスとして保存、ランキングから除外。" },
          ],
        },
      ],
    },
    zh: {
      title: "精密下降控制",
      summary: "开始下降，监视球加速，并在与线重叠时点击一次以保持命中偏移尽可能小。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程从随机高度下降新球。" },
            { label: "命中", detail: "当球与线重叠时在车道内点击。结果屏幕自动打开。" },
            { label: "错过", detail: "如果球在命中落地之前掉下车道，ラン记录为错过并从排名中排除。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "点击得分", detail: "车道接受ラン期间一次点击或点击。" },
            { label: "读取分数", detail: "命中偏移越小越好，即使球掉落时加速。" },
            { label: "错过处理", detail: "如果球在线前掉过车道，ラン保存为错过。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Precision Drop",
      summary: "Commencez une chute, regardez la balle s'accélérer, et appuyez une fois lorsqu'elle chevauche la ligne pour garder le décalage de coup aussi petit que possible.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour faire tomber une nouvelle balle d'une hauteur aléatoire." },
            { label: "Frappé", detail: "Appuyez n'importe où dans la voie quand la balle chevauche la ligne. L'écran de résultat s'ouvre automatiquement après le coup." },
            { label: "Manquer", detail: "Si la balle tombe après la voie avant que le coup ne touche, la manche est enregistrée comme un manqué." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Appuyer pour marquer", detail: "La voie accepte un clic ou un appui pendant une manche en direct." },
            { label: "Lire le score", detail: "Plus petit le décalage de coup en px, meilleur est le résultat, même lorsque la balle s'accélère en tombant." },
            { label: "Gestion des ratés", detail: "Si la balle tombe après la ligne avant le coup, la manche est enregistrée comme un manqué." },
          ],
        },
      ],
    },
  },
  "orbit-tap": {
    ja: {
      title: "Orbit Tap の遊び方",
      summary: "周回するマーカーが指定ゲートを通る瞬間にタップして成功数を稼ぎます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押してオービット開始。" },
            { label: "ヒット チェーン", detail: "ゲート内に着地するすべてのタップがクリーンヒット記録、ゲート移動。" },
            { label: "タイムアウト", detail: "ヒット目標がタイマー切れの前に満たされない場合、ランはクリアなし保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "ゲート上タップ", detail: "移動マーカーがオービットリング上の黄ゲートと重なる間にタップ。" },
            { label: "ミス処理", detail: "ゲート外のタップはミスカウント上げるがランは続行。" },
            { label: "タッチセーフに保つ", detail: "フルオービットパッドはデスクトップとタッチデバイスでタップ可能。" },
          ],
        },
      ],
    },
    zh: {
      title: "轨道点击控制",
      summary: "监视标记环绕环形，在通过突出显示的门时点击，并链接足够的命中来完成ラン。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程启动轨道。" },
            { label: "命中链", detail: "每个在门内落地的点击记录一个清洁命中并移动门。" },
            { label: "超时", detail: "如果命中目标在计时结束前未满足，ランクリアなし保存，结果屏幕自动打开。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "在门上点击", detail: "当移动标记与轨道环上的黄色门重叠时点击。" },
            { label: "错过处理", detail: "逻辑外的点击提高错误计数但ラン继续。" },
            { label: "保持触摸安全", detail: "完整的轨道垫在桌面和触摸设备上可点击。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles d'Orbit Tap",
      summary: "Regardez le marqueur faire le tour de l'anneau, appuyez tandis qu'il traverse la porte en surbrillance, et chaînez suffisamment de coups pour terminer la manche.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour démarrer l'orbite." },
            { label: "Chaîne de coups", detail: "Chaque coup atterrissant à l'intérieur de la porte enregistre un coup net et déplace la porte." },
            { label: "Timeout", detail: "Si l'objectif de coup n'est pas atteint avant l'expiration du minuteur, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Appuyez sur la porte", detail: "Appuyez tandis que le marqueur en mouvement chevauche la porte jaune sur l'anneau d'orbite." },
            { label: "Gestion des ratés", detail: "Les appuis hors de la porte augmentent le comptage des ratés mais la manche continue." },
            { label: "Rester tactile-sûr", detail: "Le plateau d'orbite complet est appuyable sur les appareils de bureau et tactiles." },
          ],
        },
      ],
    },
  },
  minesweeper: {
    ja: {
      title: "Minesweeper の遊び方",
      summary: "数字を手がかりに安全なマスを開き、地雷を避けながら盤面を進めます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押す、またはボード上の最初のセルを開く。" },
            { label: "クリア", detail: "すべてチェーンセル開ける。結果スクリーン自動的に開く。" },
            { label: "ミスをする", detail: "鉱石がボード終了して即座に結果スクリーンを開く。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "セルを開く", detail: "プライマリクリック或いはタップクローズドセル。" },
            { label: "セルにフラッグをつける", detail: "デスクトップではセカンダリクリック、タッチはフラッグモード。" },
            { label: "手がかりを読む", detail: "明かされた数は、そのセルに何個の鉱石が触れるかを示す。" },
          ],
        },
      ],
    },
    zh: {
      title: "扫雷控制",
      summary: "使用单次点击打开单元格，并随时打开指南以再次确认核心棋盘控制。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程，或在棋盘上打开第一个单元格。" },
            { label: "清除", detail: "显示每个安全单元格。棋盘结束时，结果屏幕自动打开。" },
            { label: "错误", detail: "矿石立即结束棋盘并打开失败运行的结果屏幕。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "打开单元格", detail: "主点击或点击关闭的单元格。" },
            { label: "旗帜单元格", detail: "在桌面上进行辅助点击，或在触摸设备上切换到标记模式。" },
            { label: "读取线索", detail: "显示的数字表示有多少个矿石接触该单元格。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Minesweeper",
      summary: "Utilisez un seul appui pour ouvrir les cellules et ouvrir le guide à tout moment pour reconfirmer les contrôles de plateau principaux.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche, ou ouvrez simplement la première cellule du plateau." },
            { label: "Effacer", detail: "Révélez chaque cellule sûre. Quand le plateau se termine, l'écran de résultat s'ouvre automatiquement." },
            { label: "Erreurs", detail: "Une mine termine le plateau immédiatement et ouvre l'écran de résultat avec une manche échouée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Cellule ouverte", detail: "Clic principal ou appui principal sur une cellule fermée pour la révéler." },
            { label: "Cellule d'indicateur", detail: "Clic secondaire sur une cellule fermée sur le bureau, ou passez au mode Indicateur sur les appareils tactiles." },
            { label: "Lire les indices", detail: "Un nombre révélé indique combien de mines touchent cette cellule." },
          ],
        },
      ],
    },
  },
  "hidden-find": {
    ja: {
      title: "Hidden Find の遊び方",
      summary: "見本を手がかりに、込み入った絵の中から一致する対象を探し出します。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初の混雑シーンを読み込む。" },
            { label: "シーンをクリア", detail: "各正しいタップはセットの完全になるまで次のシーンに即座に進む。" },
            { label: "タイムアウト", detail: "タイマーが終了する前にすべてのシーンターゲットが見つからない場合、ランはクリアなし保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "ターゲットを読む", detail: "正確なモチーフねボード上方に表示。" },
            { label: "一度だけタップ", detail: "シーン内のただ1つのタイル が真実の一致。正しいタップは即座にランを進める。" },
            { label: "ミスプレッシャー", detail: "間違ったタップはサポートメトリクス追加し時間を寄こさない、シーンはアクティブまま。" },
          ],
        },
      ],
    },
    zh: {
      title: "隐藏查找控制",
      summary: "研究目标主题，扫描拥挤的场景，并在时间用尽前点击一个完全匹配。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来加载第一个拥挤的场景。" },
            { label: "清除场景", detail: "每个正确的点击立即推进到下一个场景直到完整集合完成。" },
            { label: "超时", detail: "如果计时在找到每个场景目标前到期，ランクリアなし保存，结果屏幕自动打开。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "读取目标", detail: "精确的主题保持在棋盘上方可见。" },
            { label: "只点击一次", detail: "场景中只有一个瓷砖是真实的一致。正确的点击立即推进ラン。" },
            { label: "错过压力", detail: "错误的点击添加到支持指标并花费时间，但场景保持活跃。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Hidden Find",
      summary: "Étudiez le motif cible, scannez la scène surpeuplée, et appuyez sur la seule correspondance exacte avant le dépassement du temps.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour charger la première scène surpeuplée." },
            { label: "Effacer les scènes", detail: "Chaque appui correct avance immédiatement à la scène suivante jusqu'à ce que l'ensemble complet soit terminé." },
            { label: "Timeout", detail: "Si le minuteur expire avant la découverte de la cible de chaque scène, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Lire la cible", detail: "Le motif exact reste visible au-dessus du plateau." },
            { label: "N'appuyer qu'une fois", detail: "Une seule tuile dans la scène est la vraie correspondance. Les appuis corrects avancent la manche immédiatement." },
            { label: "Pression de manque", detail: "Les mauvais appuis ajoutent à la métrique de soutien et coûtent du temps, mais la scène reste active." },
          ],
        },
      ],
    },
  },
  "hue-drift": {
    ja: {
      title: "Hue Drift の遊び方",
      summary: "色の変化の流れを読み取り、欠けている色を推理して選びます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のドリフト プロンプトを読み込む。" },
            { label: "スプリントを解く", detail: "各正しい答えは直接次のプロンプトに進む、スプリント完全になるまで。" },
            { label: "タイムアウト", detail: "タイマーが切れると、ランはクリアなし保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "ドリフトを読む", detail: "1つのステップが color row不足。表示見本色を比較してパターン推定。" },
            { label: "1つの答えをタップ", detail: "4つの候補見本色の1つを選ぶ。" },
            { label: "ミスを読む", detail: "間違った答えはミスカウント増加やスプリント続行。" },
          ],
        },
      ],
    },
    zh: {
      title: "色调漂移控制",
      summary: "读取行全体的颜色漂移，推断丢失的步骤，并在计时到期前选择正确的样本。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来加载第一个漂移提示。" },
            { label: "解决冲刺", detail: "每个正确的答案直接推进到下一个提示直到冲刺完成。" },
            { label: "超时", detail: "如果计时在每个提示前到期，ランクリアなし保存。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "读取漂移", detail: "颜色行中缺少一个步骤。比较可见样本来推断模式。" },
            { label: "点击一个答案", detail: "选择四个候选样本之一来填充缺失的步骤。" },
            { label: "读取错误", detail: "错误答题增加错误计数但冲刺继续。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Hue Drift",
      summary: "Lisez la dérive des couleurs dans la ligne, déduisez l'étape manquante, et choisissez le bon échantillon avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour charger la première invite de dérive." },
            { label: "Résoudre le sprint", detail: "Chaque réponse correcte passe directement à la prochaine invite jusqu'à la fin du sprint." },
            { label: "Timeout", detail: "Si le minuteur expire avant la résolution de chaque invite, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Lire la dérive", detail: "Une étape dans la ligne de couleur manque. Comparez les échantillons visibles pour déduire le modèle." },
            { label: "Appuyez sur une réponse", detail: "Choisissez l'un des quatre échantillons candidats pour remplir l'étape manquante." },
            { label: "Lire les erreurs", detail: "Les mauvaises réponses augmentent le compteur d'erreurs mais le sprint continue." },
          ],
        },
      ],
    },
  },
  "spot-change": {
    ja: {
      title: "Spot Change の遊び方",
      summary: "2つの場面を見比べて、変化した箇所をすべて見つけてタップします。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初の比較シーンを読み込む。" },
            { label: "すべての変わりを見つける", detail: "変更されたボード上の変わったタイルを各タップ。差分セット全体が見つかるとすぐ次ラウンド。" },
            { label: "タイムアウト", detail: "タイマーが切れると、ランはクリアなし保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "両方のボードを比較", detail: "オリジナルシーンは読み取り専用。変更されたシーンのみがタップを受け入れ。" },
            { label: "変更されたタイルをタップ", detail: "正しいタップは見つかった差分をマーク、ラウンド進行。" },
            { label: "ミスを読む", detail: "間違ったタップはミスカウント増加、ランは続行。" },
          ],
        },
      ],
    },
    zh: {
      title: "位置变化控制",
      summary: "比较原始和变更的场景，点击变更棋盘上的每个实际差异，并在计时到期前完成完整集合。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来加载第一个比较场景。" },
            { label: "找到每个差异", detail: "点击变更棋盘上的每个变更瓷砖。找到完整差分集后，下一个ラウンド加载。" },
            { label: "超时", detail: "如果计时在清除每个ラウンド前到期，ランクリアなし保存。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "比较两个棋盘", detail: "原始场景是只读的。只有变更场景接受点击。" },
            { label: "点击变更的瓷砖", detail: "正确的点击标记已发现的差异并移动ラウンド。" },
            { label: "读取错误", detail: "错误的点击增加错误计数但ラン继续。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Spot Change",
      summary: "Comparez les scènes originale et modifiée, appuyez sur chaque différence réelle du plateau modifié, et terminez l'ensemble complet avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour charger la première scène de comparaison." },
            { label: "Trouver chaque différence", detail: "Appuyez sur chaque tuile modifiée du plateau modifié. Le tour suivant se charge dès que l'ensemble de différences complet est trouvé." },
            { label: "Timeout", detail: "Si le minuteur expire avant que chaque tour ne soit effacé, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Comparer les deux plateaux", detail: "La scène originale est en lecture seule. Seule la scène modifiée accepte les appuis." },
            { label: "Appuyez sur les tuiles modifiées", detail: "Les appuis corrects marquent la différence trouvée et font avancer le tour." },
            { label: "Lire les erreurs", detail: "Les mauvais appuis augmentent le comptage des erreurs mais la manche continue." },
          ],
        },
      ],
    },
  },
  "target-trail": {
    ja: {
      title: "Target Trail の遊び方",
      summary: "移動するターゲットを追いかけ、次々に正しい位置をタップしていきます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のライブターゲットをスポーン。" },
            { label: "トレイルを追従", detail: "各正しいタップはアクティブターゲットを新しいタイルに移動。" },
            { label: "タイムアウト", detail: "タイマーが切れると、ランはクリアなし保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "ライブタイルをタップ", detail: "明るいタイルのみがトレイルを進める。" },
            { label: "ミスを読む", detail: "間違ったタップはミスカウント増加、ランは停止しない。" },
            { label: "移動を保つ", detail: "訪問したタイルは暗くなりトレイル進行。" },
          ],
        },
      ],
    },
    zh: {
      title: "目标轨迹控制",
      summary: "跟踪活跃目标，当其跳到新单元格时，保持错误低，并在计时到期前完成轨迹。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来生成第一个活跃目标。" },
            { label: "追踪轨迹", detail: "每个正确的点击都将活跃目标移动到新瓷砖。" },
            { label: "超时", detail: "如果完整的轨迹在计时结束前未完成，ランクリアなし保存，结果屏幕自动打开。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "点击实时瓷砖", detail: "只有明亮的瓷砖推进轨迹。" },
            { label: "读取错误", detail: "错误的点击增加错误计数但不停止ラン。" },
            { label: "保持运动", detail: "访问过的瓷砖保持暗淡。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Target Trail",
      summary: "Suivez la cible active au moment où elle saute vers une nouvelle cellule, gardez les erreurs faibles, et terminez le sentier avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour générer la première cible en direct." },
            { label: "Suivre le sentier", detail: "Chaque appui correct déplace la cible active vers une nouvelle tuile." },
            { label: "Timeout", detail: "Si le sentier complet n'est pas fin avant l'expiration du minuteur, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Appuyez sur la tuile en direct", detail: "Seule la tuile lumineuse fait avancer le sentier." },
            { label: "Lire les erreurs", detail: "Les mauvais appuis augmentent le compteur d'erreurs mais n'arrêtent pas la manche." },
            { label: "Garder en mouvement", detail: "Les tuiles visitées restent faibles pour vous permettre de lire la progression du sentier." },
          ],
        },
      ],
    },
  },
  "number-chain": {
    ja: {
      title: "Number Chain の遊び方",
      summary: "数字を小さい順にたどり、ミスを抑えながら時間内に最後までつなげます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して番号ボード シャッフル、タイマーアーム。" },
            { label: "クリア", detail: "すべての数字キーを昇順でタップ。結果スクリーン自動的に最後の数字を開く。" },
            { label: "タイムアウト", detail: "タイマーが切れると、ランはクリアなし保存、結果スクリーン自動的に開く。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "チェーンを追従", detail: "次の現在の数字ボード上に表示、ステータス行に。" },
            { label: "慎重にタップ", detail: "正しい次の数字のみがチェーンを進める。間違ったタップはサポートメトリクス上げるがボード停止しない。" },
            { label: "速くリプレイ", detail: "新しいランシャッフルのたびに ボードリセット。" },
          ],
        },
      ],
    },
    zh: {
      title: "数字链控制",
      summary: "按升序点击编号瓷砖，保持错误低，并在计时到期前完成整个链。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来洗牌数字棋盘并启用计时。" },
            { label: "清除", detail: "以升序点击每个数字。结果屏幕在最后一个数字后自动打开。" },
            { label: "超时", detail: "如果计时在链完成前到期，ランクリアなし保存，结果屏幕自动打开。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "追踪链", detail: "当前下一个数字保持在棋盘上方和状态行中可见。" },
            { label: "小心点击", detail: "只有正确的下一个数字推进链。错误的点击提高支持指标但不停止棋盘。" },
            { label: "快速重放", detail: "每次新ラン启动时棋盘使用新的洗牌重置。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Number Chain",
      summary: "Appuyez sur les tuiles numérotées en ordre croissant, gardez les erreurs faibles, et terminez la chaîne complète avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour mélanger le plateau numérique et armer le minuteur." },
            { label: "Effacer", detail: "Appuyez sur chaque nombre en ordre croissant. L'écran de résultat s'ouvre automatiquement après le dernier nombre." },
            { label: "Timeout", detail: "Si le minuteur expire avant la chaîne complète, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Suivre la chaîne", detail: "Le prochain nombre actuel reste visible au-dessus du plateau et dans la ligne de statut." },
            { label: "Appuyez avec précaution", detail: "Seul le prochain nombre correct fait avancer la chaîne. Les mauvais appuis augmentent la métrique de soutien." },
            { label: "Rejouer rapidement", detail: "Le plateau se réinitialise avec un nouveau mélange à chaque démarrage de nouvelle manche." },
          ],
        },
      ],
    },
  },
  "path-recall": {
    ja: {
      title: "Path Recall の遊び方",
      summary: "光った経路を覚え、同じ道順をそのままたどって再現します。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押してウォッチフェーズを開始。" },
            { label: "ウォッチ フェーズ", detail: "パスは一度に1ステップを強調表示、ボードは読み取り専用。" },
            { label: "入力フェーズ", detail: "最後のフラッシュの後、同じ順序で同じセルをタップしてランを完了。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "パスを暗記", detail: "強調表示セルを使って、入力前にフル ルートを覚える。" },
            { label: "順序でリプレイ", detail: "次の正しいセルのみがパスを進める。" },
            { label: "間違ったセル", detail: "ミスは間違ったセル数を増加、ランはクリアまでまたはタイムアウトまで続行。" },
          ],
        },
      ],
    },
    zh: {
      title: "路径回忆控制",
      summary: "监视路径发光的单元格，然后以相同的顺序重放相同的单元格，在计时到期前完成。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程开始监视阶段。" },
            { label: "监视阶段", detail: "路径一次突出显示一个步骤，棋盘保持只读。" },
            { label: "输入阶段", detail: "在最后一次闪烁后，按相同顺序点击相同的单元格完成ラン。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "记住路径", detail: "使用突出显示的单元格记住完整的路线，然后输入。" },
            { label: "按顺序重放", detail: "只有下一个正确的单元格推进路径。" },
            { label: "错误的单元格", detail: "错误增加错误的单元格计数但ラン继续至清除或超时。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Path Recall",
      summary: "Regardez les cellules du chemin s'éclairer une par une, puis relisez les mêmes cellules dans le même ordre avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour commencer la phase de regarder." },
            { label: "Phase de regarder", detail: "Le chemin met en surbrillance une étape à la fois et le plateau reste en lecture seule." },
            { label: "Phase d'entrée", detail: "Après le dernier flash, appuyez sur les mêmes cellules dans le même ordre pour terminer la manche." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Mémoriser le chemin", detail: "Utilisez les cellules en surbrillance pour mémoriser l'itinéraire complet avant l'entrée." },
            { label: "Rejouer dans l'ordre", detail: "Seule la prochaine cellule correcte fait avancer le chemin." },
            { label: "Mauvaises cellules", detail: "Les erreurs augmentent le comptage des mauvaises cellules mais la manche continue." },
          ],
        },
      ],
    },
  },
  "pair-flip": {
    ja: {
      title: "Pair Flip の遊び方",
      summary: "2枚ずつカードをめくり、位置を覚えながら制限時間内にすべてのペアをそろえる。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選んでスタートすると、新しい記憶ボードがシャッフルされ、タイマーが始まる。" },
            { label: "クリア", detail: "盤面のすべてのペアをそろえると、最後の1組のあとに結果画面が自動で開く。" },
            { label: "タイムアウト", detail: "時間切れまでにペアが残っている場合、そのランは未クリアとして記録される。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "2枚のカードをめくる", detail: "まず1枚めくり、そのあとでもう1枚めくる。一致したシンボルは表示されたまま残る。" },
            { label: "不一致を確認する", detail: "シンボルが違う場合は短い表示のあとに2枚とも裏返り、ミスマッチ数が増える。" },
            { label: "集中を保つ", detail: "そろったカードはそのまま残るので、残りの候補をペアごとに絞り込める。" },
          ],
        },
      ],
    },
    zh: {
      title: "配对翻牌说明",
      summary: "一次翻开两张牌，记住它们的位置，并在倒计时结束前配对全部卡牌。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始回合", detail: "选择难度并开始游戏后，系统会洗牌新的记忆棋盘并启动计时。" },
            { label: "完成", detail: "配对棋盘上的全部卡牌后，最后一组结束时会自动打开结果画面。" },
            { label: "超时", detail: "如果倒计时结束时仍有未配对的卡牌，本次挑战会记为未完成。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "翻开两张卡", detail: "先翻开一张，再翻开另一张。配对成功的符号会继续保持可见。" },
            { label: "查看未配对结果", detail: "如果两张卡的符号不同，它们会在短暂显示后重新翻回去。" },
            { label: "保持专注", detail: "已经配对的卡牌会留在原位，你可以一组一组缩小剩余范围。" },
          ],
        },
      ],
    },
    fr: {
      title: "Commandes de Pair Flip",
      summary: "Retournez deux cartes à la fois, souvenez-vous de leurs positions, et faites correspondre chaque paire avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté puis lancez la partie pour mélanger un nouveau plateau mémoire et démarrer le chrono." },
            { label: "Terminer", detail: "Associez toutes les paires du plateau. L'écran de résultat s'ouvre automatiquement après la dernière paire." },
            { label: "Temps écoulé", detail: "S'il reste des paires lorsque le chrono se termine, la manche est enregistrée comme non terminée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Retourner deux cartes", detail: "Ouvrez une carte, puis une autre. Les symboles correspondants restent visibles." },
            { label: "Lire les non-correspondances", detail: "Si les symboles diffèrent, les deux cartes se retournent après une brève révélation et le comptage des non-correspondances augmente." },
            { label: "Rester concentré", detail: "Les cartes déjà assorties restent visibles, ce qui vous aide à réduire les possibilités paire après paire." },
          ],
        },
      ],
    },
  },
  "pulse-count": {
    ja: {
      title: "Pulse Count の遊び方",
      summary: "各ラウンドでフラッシュ回数を数え、次の観察フェーズが始まる前に見えた数字を選ぶ。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選んでスタートすると、最初のパルスラウンドが始まる。" },
            { label: "観察する", detail: "中央の信号が決まった回数だけ点滅し、その間は回答ボタンを押せない。" },
            { label: "答える", detail: "見えた回数を選ぶと、スプリントが終わるまで次のラウンドへ進む。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "まず数える", detail: "パルス信号が表示されるのは観察フェーズだけ。" },
            { label: "1つだけ答える", detail: "観察フェーズが終わったら、数字ボタンから1つ選んで回答する。" },
            { label: "間違えたとき", detail: "不正解を選ぶと誤答数が増えるが、ランはそのまま続く。" },
          ],
        },
      ],
    },
    zh: {
      title: "脉冲计数控制",
      summary: "数清每一轮闪烁的次数，并在下一次观察阶段开始前选出你看到的数字。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始回合", detail: "选择难度并开始游戏后，第一轮脉冲计数会立刻开始。" },
            { label: "观察", detail: "中央信号会按固定次数闪烁，在此期间回答按钮保持禁用。" },
            { label: "回答", detail: "选出你看到的次数后，会直接进入下一轮，直到整段冲刺结束。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "先数清次数", detail: "只有观察阶段会显示脉冲信号。" },
            { label: "选择一个答案", detail: "观察阶段结束后，使用数字按钮作答。" },
            { label: "答错时", detail: "如果选择了错误的数字，误答总数会增加，但本次挑战会继续进行。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Pulse Count",
      summary: "Comptez les flashes dans chaque tour, puis choisissez le nombre que vous avez vu avant que la prochaine phase de regarder ne commence.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour commencer le premier tour d'impulsion." },
            { label: "Regarder", detail: "Le signal central clignote un nombre fixe de fois tandis que les boutons de réponse restent désactivés." },
            { label: "Répondre", detail: "Choisissez le comptage que vous avez vu et passez directement au tour suivant jusqu'à la fin du sprint." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Compter d'abord", detail: "Seule la phase de regarder affiche le signal d'impulsion." },
            { label: "Choisir une réponse", detail: "Utilisez les boutons de numéro pour répondre après la fin de la phase de regarder." },
            { label: "Mauvaises réponses", detail: "Les comptages incorrects augmentent le total des mauvaises réponses mais la manche continue." },
          ],
        },
      ],
    },
  },
  "quick-sum": {
    ja: {
      title: "Quick Sum の遊び方",
      summary: "暗算で答えを出し、候補の中から正しい数字をすばやく選びます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のプロンプトを読み込む。" },
            { label: "各プロンプトを解く", detail: "すべての答えはスプリント完全になるまで直接次のプロンプト。" },
            { label: "タイムアウト", detail: "タイマーが切れると、ランはクリアなし保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "プロンプトを読む", detail: "現在の算数プロンプトはボード中央に表示。" },
            { label: "答えをタップ", detail: "各プロンプトの4つの答えボタンの1つを選ぶ。" },
            { label: "間違った答え", detail: "不正ピックは間違った答えカウント増加、スプリントは続行。" },
          ],
        },
      ],
    },
    zh: {
      title: "快速求和控制",
      summary: "从答案网格中解决每个算术提示，保持错误答案低，并在计时到期前清除冲刺。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来加载第一个提示。" },
            { label: "解决每个提示", detail: "每个答案直接进入下一个提示直到冲刺完成。" },
            { label: "超时", detail: "如果计时在每个提示前到期，ランクリアなし保存，结果屏幕自动打开。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "读取提示", detail: "当前算术提示显示在棋盘中心。" },
            { label: "点击答案", detail: "选择每个提示的四个答案按钮之一。" },
            { label: "错误的答案", detail: "不正确的选择增加错误答案计数但冲刺继续。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Quick Sum",
      summary: "Résolvez chaque invite arithmétique à partir de la grille de réponses, gardez les mauvaises réponses faibles, et effacez le sprint avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour charger la première invite." },
            { label: "Résoudre chaque invite", detail: "Chaque réponse passe directement à l'invite suivante jusqu'à la fin du sprint." },
            { label: "Timeout", detail: "Si le minuteur expire avant la résolution de chaque invite, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Lire l'invite", detail: "L'invite arithmétique actuelle s'affiche au centre du plateau." },
            { label: "Appuyez sur la réponse", detail: "Choisissez l'un des quatre boutons de réponse pour chaque invite." },
            { label: "Mauvaises réponses", detail: "Les réponses incorrectes augmentent le comptage des mauvaises réponses mais le sprint continue." },
          ],
        },
      ],
    },
  },
  "shape-morph": {
    ja: {
      title: "Shape Morph の遊び方",
      summary: "図形の変化ルールを読み取り、次に来る形を選んでいきます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のモーフプロンプトを読み込む。" },
            { label: "ルールを読む", detail: "各プロンプトは同じグリフの3つのステップ、単一のビジュアルルールを通して変わる。" },
            { label: "移動を保つ", detail: "すべての答えはスプリント完全またはタイマー切れになるまで次のプロンプトに進む。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "各ステップを比較", detail: "回転、スケール、またはカットをシーケンス全体で追跡してから答え選択肢を見る。" },
            { label: "1つの選択肢をタップ", detail: "シーケンス内に続くはずのグリフを選ぶ。" },
            { label: "間違った答え", detail: "正しくない選択肢はサポートメトリクス増加、スプリント続行。" },
          ],
        },
      ],
    },
    zh: {
      title: "形态变形控制",
      summary: "读取字形如何从一步到一步变化，选择序列中的下一个变形，并在计时到期前完成冲刺。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来加载第一个变形提示。" },
            { label: "读取规则", detail: "每个提示显示通过单一视觉规则变化的同一字形的三个步骤。" },
            { label: "保持运动", detail: "每个答案推进到下一个提示直到冲刺完成或计时到期。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "比较每个步骤", detail: "在查看答案选项之前跟踪序列中的旋转、缩放或切割。" },
            { label: "点击一个选择", detail: "选择序列中应该出现的字形。" },
            { label: "错误的答案", detail: "不正确的选择增加支持指标但冲刺继续。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Shape Morph",
      summary: "Lisez comment le glyphe change d'étape en étape, choisissez la prochaine forme transformée, et terminez le sprint avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour charger la première invite de transformation." },
            { label: "Lire la règle", detail: "Chaque invite montre trois étapes du même glyphe changeant via une seule règle visuelle." },
            { label: "Garder le mouvement", detail: "Chaque réponse avance vers la prochaine invite jusqu'à la fin du sprint ou l'expiration du minuteur." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Comparer chaque étape", detail: "Suivez la rotation, l'échelle ou les coupures à travers la séquence avant de regarder les choix de réponse." },
            { label: "Appuyez sur un choix", detail: "Choisissez le glyphe qui devrait apparaître ensuite dans la séquence." },
            { label: "Mauvaises réponses", detail: "Les choix incorrects augmentent la métrique de soutien mais le sprint continue." },
          ],
        },
      ],
    },
  },
  "sum-grid": {
    ja: {
      title: "Sum Grid の遊び方",
      summary: "数字を配置して、すべての行と列の合計を目標値にそろえます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のターゲットグリッドを読み込む。" },
            { label: "グリッドをクリア", detail: "候補数をすべて正しく配置してシーケンス内各グリッド解く。最後のグリッド後 結果スクリーン自動的に開く。" },
            { label: "タイムアウト", detail: "タイマーが切れると、ランはクリアなし保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "数を選ぶ", detail: "銀行内の候補数をタップしてアーム。" },
            { label: "配置または削除", detail: "グリッドセルをタップして選択した数を配置、または有効セルをタップして銀行に戻す。" },
            { label: "ターゲットを読む", detail: "各行と列のターゲット合計はグリッド脇に表示。" },
          ],
        },
      ],
    },
    zh: {
      title: "求和网格控制",
      summary: "选择候选数字，将其放入网格，并使每一行和每一列的总和在计时到期前与其目标匹配。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来加载第一个目标网格。" },
            { label: "清除网格", detail: "通过正确放置所有候选数字按顺序解决每个网格。最后网格后结果屏幕自动打开。" },
            { label: "超时", detail: "如果计时在完整集解决前到期，ランクリアなし保存，结果屏幕自动打开。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "选择一个数字", detail: "点击银行中的候选数字来装备。" },
            { label: "放置或删除", detail: "点击网格单元格放置选定数字，或点击已填充单元格将其返回银行。" },
            { label: "读取目标", detail: "每行和每列的目标总和显示在网格旁边。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Sum Grid",
      summary: "Sélectionnez un nombre candidat, placez-le dans la grille, et faites correspondre tous les totaux des lignes et colonnes à sa cible avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour charger la première grille cible." },
            { label: "Effacer les grilles", detail: "Résolvez chaque grille en séquence en plaçant correctement tous les nombres candidats. L'écran de résultat s'ouvre automatiquement après la dernière grille." },
            { label: "Timeout", detail: "Si le minuteur expire avant la résolution de l'ensemble complet, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Choisir un nombre", detail: "Appuyez sur un nombre candidat dans la banque pour l'armer." },
            { label: "Placer ou supprimer", detail: "Appuyez sur une cellule de grille pour placer le nombre sélectionné, ou appuyez sur une cellule remplie pour la retourner à la banque." },
            { label: "Lire les cibles", detail: "Le somme cible de chaque ligne et colonne s'affiche à côté de la grille." },
          ],
        },
      ],
    },
  },
  "swap-solve": {
    ja: {
      title: "Swap Solve の遊び方",
      summary: "2つのマスを入れ替えながら、崩れた配置を正しい並びへ戻します。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押してスクランブルボードを生成、固定スワップ予算付き。" },
            { label: "クリア", detail: "ターゲットボード正確にマッチする前にタイマーまたはスワップ予算期限切れ。結果スクリーン自動的にクリアで開く。" },
            { label: "失敗", detail: "スワップ予算が使い果たされまたはタイマーが期限切れ前にボード復元、ランは失敗として保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "最初のタイルを選択", detail: "スワップ用にアーム するにはライブタイルをタップ。" },
            { label: "スワップを完了", detail: "2番目のタイルをタップして2つの位置をインスタント交換。" },
            { label: "プレッシャーを追跡", detail: "不一致カウント、スワップ予算、残り時間を監視。" },
          ],
        },
      ],
    },
    zh: {
      title: "交换求解控制",
      summary: "比较活棋盘与目标棋盘，选择两个单元格交换它们，并在时间或交换预算用尽前恢复完整配置。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程生成一个打乱的棋盘，带有固定的交换预算。" },
            { label: "清除", detail: "在计时或交换预算到期前正确匹配目标棋盘。结果屏幕清除后自动打开。" },
            { label: "失败", detail: "如果交换预算耗尽或计时结束前棋盘未恢复，ランを失败报存，结果屏幕自动打开。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "选择第一个瓷砖", detail: "点击任何活瓷砖装备交换。" },
            { label: "完成交换", detail: "点击第二个瓷砖立即交换两个位置。" },
            { label: "追踪压力", detail: "监视不匹配计数、交换预算和剩余时间。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Swap Solve",
      summary: "Comparez le plateau en direct avec le plateau cible, sélectionnez deux cellules pour les échanger, et restaurez l'arrangement complet avant l'expiration du temps ou du budget d'échange.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour générer un plateau brouillé avec un budget d'échange fixe." },
            { label: "Effacer", detail: "Corresponder exactement le plateau cible avant l'expiration du minuteur ou du budget d'échange. L'écran de résultat s'ouvre automatiquement à l'effacement." },
            { label: "Échouer", detail: "Si le budget d'échange est épuisé ou que le minuteur expire avant la restauration du plateau, la manche est enregistrée comme échouée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Sélectionner la première tuile", detail: "Appuyez sur n'importe quelle tuile en direct pour l'armer pour échange." },
            { label: "Effectuer l'échange", detail: "Appuyez sur une deuxième tuile pour échanger instantanément les deux positions." },
            { label: "Pression de piste", detail: "Regardez le comptage des non-correspondances, le budget d'échange et le temps restant." },
          ],
        },
      ],
    },
  },
  "pattern-echo": {
    ja: {
      title: "Pattern Echo の遊び方",
      summary: "光った順番を覚え、同じ順序でパッドを押して再現します。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して新しいシーケンスを開始、タイマーをアーム。" },
            { label: "ウォッチ フェーズ", detail: "各パッドは順序で一度ライト。このフェーズ中タップできない—単にシーケンスを覚える。" },
            { label: "入力フェーズ", detail: "最後のパッドが消えた後、見た正確な順序でパッドをタップ。結果スクリーン自動的にクリアで開く。" },
            { label: "タイムアウト", detail: "タイマーが切れると、ランはクリアなし保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "慎重に見る", detail: "ステータス行は シーケンスが再生している間 watching を表示。各パッドは一度フラッシュ。" },
            { label: "順序でタップ", detail: "ウォッチフェーズ後 ステータスはライブに切り替わり。見た同じ順序でパッドをタップ。" },
            { label: "間違ったタップ", detail: "不正なタップは間違った入力カウント増加。ランは継続。" },
          ],
        },
      ],
    },
    zh: {
      title: "模式回响控制",
      summary: "看着彩色垫按顺序闪烁，然后以完全相同的顺序再現垫，在计时到期前完成。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程开始新序列并启用计时。" },
            { label: "监视阶段", detail: "每个垫按顺序点亮一次。此阶段无法点击—只需记住序列。" },
            { label: "输入阶段", detail: "在最后一个垫衰落后，按您看到的完全相同的顺序点击垫。结果屏幕清除后自动打开。" },
            { label: "超时", detail: "如果计时在序列完成前到期，ランクリアなし保存，结果屏幕自动打开。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "仔细观察", detail: "当序列播放时，状态行显示监视。每个垫闪烁一次。" },
            { label: "按顺序点击", detail: "监视阶段后状态切换到活跃。按您看到的相同顺序点击垫。" },
            { label: "错误的点击", detail: "不正确的点击增加错误输入计数但不停止ラン。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Pattern Echo",
      summary: "Regardez les coussins colores clignoter en séquence, puis reproduisez l'ordre exact identique avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour commencer une nouvelle séquence et armer le minuteur." },
            { label: "Phase de regarder", detail: "Chaque coussin clignote une fois en ordre. Vous ne pouvez pas appuyer pendant cette phase—mémorisez simplement la séquence." },
            { label: "Phase d'entrée", detail: "Après l'estompement du dernier coussin, appuyez sur les coussins dans le même ordre exact que vous avez vu. L'écran de résultat s'ouvre automatiquement à l'effacement." },
            { label: "Timeout", detail: "Si le minuteur expire avant la fin de la séquence, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Regarder avec soin", detail: "La ligne d'état affiche Regarder tandis que la séquence se lit. Chaque coussin clignote une fois." },
            { label: "Appuyez dans l'ordre", detail: "Après la phase de regarder, le statut bascule à En direct. Appuyez sur les coussins dans le même ordre." },
            { label: "Mauvais appuis", detail: "Les appuis incorrects augmentent le comptage des entrées incorrectes mais n'arrêtent pas la manche." },
          ],
        },
      ],
    },
  },
  "sequence-point": {
    ja: {
      title: "Sequence Point の遊び方",
      summary: "点が光る順番を記憶し、同じ位置を同じ順でタップして再現します。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のウォッチフェーズを開始。" },
            { label: "シーケンスを成長させる", detail: "各クリアされたラウンドは次のシーケンスに1つ多くのポイント追加。" },
            { label: "タイムアウト", detail: "タイマーが切れると、ランはクリアなし保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "最初に見る", detail: "ウォッチフェーズ中、グリッドポイントは順序でフラッシュ。入力はフラッシュシーケンス終了まで無視。" },
            { label: "順序でリプレイ", detail: "入力フェーズ中、同じ順序で同じポイントをタップ。" },
            { label: "ミスを読む", detail: "間違ったタップはミスカウント増加。スプリント続行。" },
          ],
        },
      ],
    },
    zh: {
      title: "序列点控制",
      summary: "观看序列点在网格上闪烁，然后通过增长的记忆冲刺以相同的顺序点击相同的点。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程开始第一个监视阶段。" },
            { label: "增长序列", detail: "每个清除的ラウンド向下一个序列添加点。" },
            { label: "超时", detail: "如果计时在最后ラウンド前到期，ランクリアなし保存，结果屏幕自动打开。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "首先观察", detail: "在监视阶段，网格点按顺序闪烁。闪烁序列结束前输入被忽略。" },
            { label: "按顺序重放", detail: "在输入阶段，按相同顺序点击相同的点。" },
            { label: "读取错误", detail: "错误的点击增加错误计数但冲刺继续。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Sequence Point",
      summary: "Regardez la séquence de points clignoter sur la grille, puis appuyez sur les mêmes points dans le même ordre à travers un sprint mémoire croissant.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour commencer la première phase de regarder." },
            { label: "Grandir la séquence", detail: "Chaque tour complété ajoute un point à la séquence suivante." },
            { label: "Timeout", detail: "Si le minuteur expire avant que le tour final ne soit complété, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "D'abord regarder", detail: "Pendant la phase de regarder, les points du plateau clignotent en ordre. L'entrée est ignorée jusqu'à la fin de la séquence de clignotement." },
            { label: "Relire dans l'ordre", detail: "Pendant la phase d'entrée, appuyez sur les mêmes points dans le même ordre." },
            { label: "Lire les erreurs", detail: "Les mauvais appuis augmentent le compteur d'erreurs mais le sprint continue." },
          ],
        },
      ],
    },
  },
  "symbol-hunt": {
    ja: {
      title: "Symbol Hunt の遊び方",
      summary: "指定された記号だけを探し出し、まぎらわしいダミーを避けながら全て見つけます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押してシンボルボードをランダム化。" },
            { label: "ターゲットを探す", detail: "ターゲット シンボルと一致するすべてのタイルをタップ。" },
            { label: "タイムアウト", detail: "タイマーが切れると、ランはクリアなし保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "ターゲットを読む", detail: "ターゲット シンボルはランの全体を通じてボード上方に表示。" },
            { label: "慎重にタップ", detail: "正しいシンボルは消える。間違ったタップはサポートメトリクス増加。" },
            { label: "タッチセーフに保つ", detail: "すべてのシンボルタイルは1級タップターゲット。" },
          ],
        },
      ],
    },
    zh: {
      title: "符号搜寻控制",
      summary: "找到目标符号的每个副本，忽略假人，并在计时到期前清除整个棋盘。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来随机化一个新符号棋盘。" },
            { label: "追猎目标", detail: "点击与目标符号匹配的每个瓷砖。" },
            { label: "超时", detail: "如果计时在任何目标符号前到期时，ランクリアなし保存，结果屏幕自动打开。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "读取目标", detail: "目标符号在ラン过程中保持在棋盘上方可见。" },
            { label: "小心点击", detail: "正确的符号消失。错误的点击增加支持指标。" },
            { label: "保持触摸安全", detail: "每个符号瓷砖都是第一类点击目标。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Symbol Hunt",
      summary: "Trouvez chaque copie du symbole cible, ignorez les leurres, et effacez le plateau complet avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour randomiser un nouveau plateau de symboles." },
            { label: "Chasser la cible", detail: "Appuyez sur chaque tuile correspondant au symbole cible." },
            { label: "Timeout", detail: "Si le minuteur expire avant la trouve de tous les symboles cibles, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Lire la cible", detail: "Le symbole cible reste visible au-dessus du plateau tout au long de la manche." },
            { label: "Appuyez avec précaution", detail: "Les symboles corrects disparaissent. Les mauvais appuis augmentent la métrique de soutien." },
            { label: "Rester tactile-sûr", detail: "Chaque tuile de symbole est une cible d'appui de première classe." },
          ],
        },
      ],
    },
  },
  "light-grid": {
    ja: {
      title: "Light Grid の遊び方",
      summary: "セルを切り替えて光の配置を調整し、目標のパターンと一致させます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して新しいターゲットパターンを生成。" },
            { label: "ターゲットをマッチ", detail: "ライブグリッドがターゲットグリッドにマッチするとランクリア。" },
            { label: "タイムアウト", detail: "タイマーが切れると両グリッドがマッチしない場合、ランはクリアなし保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "ライブグリッドをタップ", detail: "各タップは選択されたセルとその直交隣人をフリップ。" },
            { label: "ターゲットを読む", detail: "ターゲットグリッドは全ランにわたってライブグリッドの横に表示。" },
            { label: "ムーブ", detail: "すべての合法タップはステータスチップと結果に表示されるムーブカウント増加。" },
          ],
        },
      ],
    },
    zh: {
      title: "灯光网格控制",
      summary: "通过翻转一个单元格及其正交邻居，将活棋盘与目标进行匹配。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程生成新的目标模式。" },
            { label: "匹配目标", detail: "当活棋盘与目标棋盘匹配时ラン清除。" },
            { label: "超时", detail: "如果计时在两个网格匹配前到期，ランクリアなし保存。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "点击活棋盘", detail: "每个点击翻转所选单元格及其正交邻居。" },
            { label: "读取目标", detail: "目标棋盘保持在活棋盘旁边整个ラン。" },
            { label: "移动", detail: "每个合法点击都增加状态芯片和结果中显示的移动计数。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Light Grid",
      summary: "Faites correspondre la grille en direct avec la cible en retournant une cellule et ses voisins orthogonaux.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour générer un nouveau motif cible." },
            { label: "Correspondre à la cible", detail: "La manche s'efface dès que la grille en direct correspond à la grille cible." },
            { label: "Timeout", detail: "Si le minuteur expire avant la correspondance des deux grilles, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Appuyez sur la grille en direct", detail: "Chaque appui retourne la cellule sélectionnée et ses voisins orthogonaux." },
            { label: "Lire la cible", detail: "La grille cible reste visible à côté de la grille en direct tout au long de la manche." },
            { label: "Mouvements", detail: "Chaque appui légal augmente le comptage des mouvements affiché dans les puces d'état et le résultat." },
          ],
        },
      ],
    },
  },
  "tile-shift": {
    ja: {
      title: "Tile Shift の遊び方",
      summary: "行と列をずらしてタイルの並びを整え、目標パターンへ近づけます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押してライブボードをスクランブル。" },
            { label: "ボードを整列させる", detail: "行と列コントロールを使ってライブボードがターゲットパターンにマッチするまで。" },
            { label: "タイムアウト", detail: "タイマーが切れるまえにボードがマッチしない場合、ランはクリアなし保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "行をシフト", detail: "行コントロールを使ってその行を1ステップ右に回転。" },
            { label: "列をシフト", detail: "列コントロールを使ってその行を1ステップ下に回転。" },
            { label: "ムーブ", detail: "すべてのシフトは結果概要に1つのムーブとしてカウント。" },
          ],
        },
      ],
    },
    zh: {
      title: "瓷砖班次控制",
      summary: "将行向右移动，将列向下移动，直到活棋盘与目标模式匹配。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来打乱活棋盘。" },
            { label: "对齐棋盘", detail: "使用行和列控制直到活棋盘与目标相匹配。" },
            { label: "超时", detail: "如果计时在棋盘匹配前到期，ランクリアなし保存。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "移位一行", detail: "使用行控制将该行向右旋转一步。" },
            { label: "移位一列", detail: "使用列控制将该行向下旋转一步。" },
            { label: "移动", detail: "每个班次在结果摘要中计为一个移动。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Tile Shift",
      summary: "Faites glisser les lignes vers la droite et les colonnes vers le bas jusqu'à ce que la grille en direct correspond au motif cible.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour brouiller la grille en direct." },
            { label: "Aligner le plateáu", detail: "Utilisez les contrôles de ligne et de colonne jusqu'à ce que la grille en direct correspond à la cible." },
            { label: "Timeout", detail: "Si le minuteur expire avant la correspondance des grilles, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Décaler une ligne", detail: "Utilisez la commande de ligne pour faire pivoter cette ligne d'une étape vers la droite." },
            { label: "Décaler une colonne", detail: "Utilisez la commande de colonne pour faire pivoter cette ligne d'une étape vers le bas." },
            { label: "Mouvements", detail: "Chaque décalage compte comme un mouvement dans le résumé du résultat." },
          ],
        },
      ],
    },
  },
  "tile-instant": {
    ja: {
      title: "Tile Instant の遊び方",
      summary: "最初に完成形を覚え、あとから入れ替え操作で同じ配置を再現します。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初のターゲットボードを簡潔に明かす。" },
            { label: "ウォッチして再構築", detail: "ターゲットボードはウォッチフェーズの後隠れ、スクランブルライブボードはスワップのためアンロック。" },
            { label: "ラウンドを進める", detail: "各解決ボードはスプリント完全になるまで次のウォッチフェーズ自動的に開始。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "最初に暗記", detail: "ウォッチフェーズのみフルターゲット配列を表示。その後、ターゲットパネルは値を隠す。" },
            { label: "2つのタイルをスワップ", detail: "1つのライブタイルをタップ、その後別のライブタイルをタップして位置交換。" },
            { label: "ムーブを読む", detail: "すべての完了スワップは結果概要に1つのムーブを追加。" },
          ],
        },
      ],
    },
    zh: {
      title: "瓷砖即时控制",
      summary: "在监视阶段记住目标棋盘，然后通过一次交换两个活瓷砖在隐藏的目标上重建打乱的活棋盘。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程简短地显示第一条目标棋盘。" },
            { label: "监视然后重建", detail: "目标棋盘在监视阶段后隐藏，打乱的活棋盘解锁以进行交换。" },
            { label: "推进轮", detail: "每个解决的棋盘应自动启动下一个监视阶段直到冲刺完成。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "首先记住", detail: "只有监视阶段显示完整的目标配置。之后，目标面板隐藏其值。" },
            { label: "交换两个瓷砖", detail: "点击一个活瓷砖，然后点击另一个活瓷砖来交换位置。" },
            { label: "读取移动", detail: "每个完成的交换向结果摘要添加一个移动。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Tile Instant",
      summary: "Mémorisez le plateau cible pendant la phase de regarder, puis reconstruisez le plateau en direct brouillé en échangeant deux tuiles en direct à la fois.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour révéler brièvement le premier plateau cible." },
            { label: "Regarder puis reconstruire", detail: "Le plateau cible se cache après la phase de regarder, et le plateau en direct brouillé se déverrouille pour l'échange." },
            { label: "Avancer les tours", detail: "Chaque plateau résolu démarre automatiquement la phase de regarder suivante jusqu'à la fin du sprint." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Mémoriser en premier", detail: "Seule la phase de regarder affiche l'arrangement cible complet. Après cela, le panneau cible cache ses valeurs." },
            { label: "Échangez deux tuiles", detail: "Appuyez sur une tuile en direct, puis appuyez sur une autre tuile en direct pour échanger les positions." },
            { label: "Lire les mouvements", detail: "Chaque échange complété ajoute un mouvement au résumé du résultat." },
          ],
        },
      ],
    },
  },
  "zone-lock": {
    ja: {
      title: "Zone Lock の遊び方",
      summary: "共有マスを切り替えて、複数のゾーンを同時に目標状態へそろえます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して最初の空ゾーンボードを開く。" },
            { label: "読むすべてのゾーン", detail: "各ゾーンカードはそのターゲット ロックカウント と現在のカウント を表示、1つのセルは複数のカードに影響可能。" },
            { label: "ラウンドを進める", detail: "すべてのゾーンカードがロックするとき、次のパズルはフルセットクリアまで自動的に読み込む。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "セルを切り替える", detail: "任意のセルをタップしてオープン とロック済みの間で切り替え。" },
            { label: "オーバーラップを追跡", detail: "各セルはそれが属するゾーンラベルを表示。" },
            { label: "リセットは慎重に", detail: "リセット ボード は現在のパズルをクリア、リセットを結果概要に追加。" },
          ],
        },
      ],
    },
    zh: {
      title: "区域锁定控制",
      summary: "键入共享单元格，直到每个重叠区在同一时间达到其目标锁定计数。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程打开第一个空区棋盘。" },
            { label: "读取每个区", detail: "每个区卡显示其目标锁定计数和当前计数，一个单元格可以影响多个卡。" },
            { label: "推进轮", detail: "当每个区卡锁定时，下一个谜题直到整个集清除时自动加载。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "切换单元格", detail: "点击任何单元格在打开和锁定之间切换。" },
            { label: "追踪重叠", detail: "每个单元格显示它所属的区标签。" },
            { label: "小心重置", detail: "重置棋盘清除当前谜题并向结果摘要添加一个重置。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Zone Lock",
      summary: "Basculez les cellules partagées jusqu'à ce que chaque zone qui chevauche atteigne son décompte de blocage cible au même moment.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour ouvrir le premier plateau de zone vide." },
            { label: "Lire chaque zone", detail: "Chaque carte de zone affiche son décompte de blocage cible et son décompte actuel, et une cellule peut affecter plusieurs cartes." },
            { label: "Avancer les tours", detail: "Quand chaque carte de zone se verrouille, le puzzle suivant se charge automatiquement jusqu'à la fin de l'ensemble." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Cellules de commutation", detail: "Appuyez sur n'importe quelle cellule pour basculer entre ouverte et verrouillée." },
            { label: "Chevauchement de piste", detail: "Chaque cellule affiche les étiquettes de zone à laquelle elle appartient." },
            { label: "Réinitialiser avec précaution", detail: "Le plateau de réinitialisation efface le puzzle actuel et ajoute une réinitialisation au résumé du résultat." },
          ],
        },
      ],
    },
  },
  "stack-sort": {
    ja: {
      title: "Stack Sort の遊び方",
      summary: "スタック間で色を移し替え、同じ色ごとにきれいにまとめます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して新しいスタックパズルを読み込む。" },
            { label: "色でソート", detail: "トークンを移動してすべての非空スタックが単一の色のみ含むまで。" },
            { label: "タイムアウト", detail: "タイマー切れ前にパズルがソートされない場合、ランはクリアなし保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "ソースを選択", detail: "少なくとも1つのトークンを持つスタックをタップして上部トークンを選択。" },
            { label: "宛先を選択", detail: "ムーブが合法の場合、別のスタックをタップして上部トークンを移動。" },
            { label: "無効なムーブ", detail: "違法の宛先はトークンを移動しない。ランは続行。" },
          ],
        },
      ],
    },
    zh: {
      title: "堆栈排序控制",
      summary: "选择源堆栈，然后选择目标堆栈，将每种颜色分组到其自己的堆栈中，然后在计时到期前。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来加载新的堆栈谜题。" },
            { label: "按颜色排序", detail: "移动令牌，直到每个非空堆栈仅包含一种颜色。" },
            { label: "超时", detail: "如果计时在谜题排序前到期，ランクリアなし保存，结果屏幕自动打开。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "选择源", detail: "点击至少有一个令牌的堆栈选择其顶令牌。" },
            { label: "选择目标", detail: "当移动为合法时点击另一个堆栈来移动令牌。" },
            { label: "无效的移动", detail: "非法目标不移动令牌，ラン继续。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Stack Sort",
      summary: "Sélectionnez une pile source, puis une pile de destination, et groupez chaque couleur dans sa propre pile avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour charger un nouveau puzzle de pile." },
            { label: "Trier par couleur", detail: "Déplacez les jetons jusqu'à ce que chaque pile non vide contienne une seule couleur." },
            { label: "Timeout", detail: "Si le minuteur expire avant le tri du puzzle, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Sélectionner la source", detail: "Appuyez sur une pile avec au moins un jeton pour sélectionner son jeton supérieur." },
            { label: "Sélectionner la destination", detail: "Appuyez sur une autre pile pour déplacer le jeton lorsque le mouvement est légal." },
            { label: "Mouvements invalides", detail: "Les destinations illégales ne déplacent pas le jeton, et la manche continue." },
          ],
        },
      ],
    },
  },
  "mirror-match": {
    ja: {
      title: "Mirror Match の遊び方",
      summary: "見本をもとに左右対称の配置を作り、目標のパターンを再現します。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して新しいターゲット とミラーボードを生成。" },
            { label: "ターゲットをミラー", detail: "編集可能なボード上のセルを切り替えてミラーターゲットパターンにマッチするまで。" },
            { label: "タイムアウト", detail: "タイマー切れ前にミラーパターンが完了しない場合、ランはクリアなし保存。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "ターゲットを読む", detail: "ターゲットボードは全ランにわたって左側に表示。" },
            { label: "ミラーを切り替える", detail: "編集可能なボード上のセルをタップしてオンまたはオフを切り替え。" },
            { label: "ムーブ", detail: "すべての切り替えは結果概要に1つのムーブとしてカウント。" },
          ],
        },
      ],
    },
    zh: {
      title: "镜像匹配控制",
      summary: "使用目标棋盘作为参考，在编辑棋盘上重建其镜像模式，在计时到期前完成。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程生成新的目标和镜像棋盘。" },
            { label: "镜像目标", detail: "切换编辑棋盘上的单元格，直到它匹配镜像目标模式。" },
            { label: "超时", detail: "如果计时在镜像模式完成前到期，ランクリアなし保存。" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "读取目标", detail: "目标棋盘保持在整个ラン的左侧可见。" },
            { label: "切换镜像", detail: "点击编辑棋盘上的单元格打开或关闭。" },
            { label: "移动", detail: "每个切替在结果摘要中计为一个移动。" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Mirror Match",
      summary: "Utilisez le plateau cible comme référence et reconstruisez son motif en miroir sur le plateau modifiable avant l'expiration du minuteur.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour générer un nouveau plateau cible et en miroir." },
            { label: "Mettre en miroir la cible", detail: "Basculez les cellules du plateau modifiable jusqu'à ce qu'il correspond au motif cible en miroir." },
            { label: "Timeout", detail: "Si le minuteur expire avant l'achèvement du motif en miroir, la manche est enregistrée comme non effacée." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Lire la cible", detail: "Le plateau cible reste visible sur la gauche tout au long de la manche." },
            { label: "Basculer le miroir", detail: "Appuyez sur une cellule du plateau modifiable pour la basculer sur ou hors." },
            { label: "Mouvements", detail: "Chaque bascule compte comme un mouvement dans le résumé du résultat." },
          ],
        },
      ],
    },
  },
  sudoku: {
    ja: {
      title: "Sudoku の遊び方",
      summary: "行・列・3x3 ブロックに同じ数字が重ならないように盤面を埋めます。",
      sections: [
        {
          title: "ラン フロー",
          items: [
            { label: "ランを開始", detail: "難易度を選択してスタートランを押して新しいパズルを開始。" },
            { label: "クリア", detail: "すべての編集可能セルを正しい数字で満たす। 結果スクリーン自動的に開く。" },
            { label: "ランを終了", detail: "ライブパズル中、ランを終了をクリアなし結果を保存して移動するとき。" },
          ],
        },
        {
          title: "ボード操作",
          items: [
            { label: "セルを選択", detail: "任意の編集可能正方形をタップしてその焦点。" },
            { label: "数字を入力", detail: "キーパッドを使用またはキーボードで1-9を押す。" },
            { label: "クリアまたはヒント", detail: "セルをクリア、削除、またはバックスペースを押す। ヒントまたはHを使用して次の正しい数字を取得。" },
          ],
        },
      ],
    },
    zh: {
      title: "数独控制",
      summary: "启动谜题，选择单元格，并使用键盘或键盘快捷方式填充棋盘，而无需混淆屏幕。",
      sections: [
        {
          title: "过程流程",
          items: [
            { label: "开始过程", detail: "选择难度并按开始过程来开始新谜题।" },
            { label: "清除", detail: "用正确的数字填充每个编辑单元格來完成谜题，结果屏幕自动打开।" },
            { label: "结束ラン", detail: "在活ラン期间，在想要存储未清除的结果并继续前，使用结束ラン।" },
          ],
        },
        {
          title: "棋盘控制",
          items: [
            { label: "选择单元格", detail: "点击任何编辑的正方形使其获得焦点।" },
            { label: "输入数字", detail: "使用键盘或在键盘上按1-9।" },
            { label: "清除或提示", detail: "按清除单元格、删除或退格।使用提示或按H获取下一个正确数字।" },
          ],
        },
      ],
    },
    fr: {
      title: "Contrôles de Sudoku",
      summary: "Commencez un puzzle, sélectionnez une cellule, et utilisez le clavier numérique ou les raccourcis clavier pour remplir le plateau sans encombrer l'écran.",
      sections: [
        {
          title: "Flux de manche",
          items: [
            { label: "Commencer la manche", detail: "Choisissez une difficulté et appuyez sur Commencer la manche pour commencer un nouveau puzzle." },
            { label: "Effacer", detail: "Remplissez chaque cellule modifiable avec le chiffre correct pour terminer le puzzle et ouvrir l'écran de résultat automatiquement." },
            { label: "Terminer la manche", detail: "Utiliser Terminer la manche pendant un puzzle en direct quand vous voulez stocker un résultat non effacé et continuer." },
          ],
        },
        {
          title: "Contrôles du plateau",
          items: [
            { label: "Sélectionner une cellule", detail: "Appuyez sur n'importe quel carré modifiable pour le concentrer." },
            { label: "Entrer un chiffre", detail: "Utilisez le clavier numérique ou appuyez sur 1-9 sur le clavier." },
            { label: "Effacer ou indice", detail: "Appuyez sur Effacer la cellule, Supprimer ou Retour arrière. Appuyez sur H ou Utiliser l'indice pour le prochain chiffre correct." },
          ],
        },
      ],
    },
  },
};
