+++
title = "My Emacs Config"
date = 2024-08-24
tags = ["emacs", "config"]
draft = false
+++

## このページについて {#このページについて}

自分のinit.elの設定メモです。元の設定はOrg modeで管理しています。
そこから `org-babel-tangle` で `early-init.el` と `init.el` を出力しています。

出力後のファイル全体は以下から参照ください。

<https://github.com/grugrut/dotfiles/tree/master/.emacs.d>


### 自分の環境 {#自分の環境}

私は以下の環境で利用しています。

-   OS: Windows (wsl)
-   キーボード配列: JP106(をベースにした独自配列)


## Early Init {#early-init}

Emacs 27から `early-init.el` が追加された。
正直、効果は感じられないもののせっかくなので利用している。


### early-init.el ヘッダ {#early-init-dot-el-ヘッダ}

```emacs-lisp
;;; early-init.el --- My early-init script -*- coding: utf-8 ; lexical-binding: t -*-
;; Author: grugrut <grugruglut+github@gmail.com>
;; URL:
;; Version: 1.00

;; This program is free software: you can redistribute it and/or modify
;; it under the terms of the GNU General Public License as published by
;; the Free Software Foundation, either version 3 of the License, or
;; (at your option) any later version.

;; This program is distributed in the hope that it will be useful,
;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;; GNU General Public License for more details.

;; You should have received a copy of the GNU General Public License
;; along with this program.  If not, see <http://www.gnu.org/licenses/>.

;;; Commentary:

;;; Code:

```


### init処理中に問題があれば気付けるように {#init処理中に問題があれば気付けるように}

エラーがおきたときに、ログだけだと問題がどこにあるのかデバッグが大変なので、
ちゃんとわかるようにしている。

```emacs-lisp
(setq debug-on-error t)
```


### init.orgだけ編集してたら警告 {#init-dot-orgだけ編集してたら警告}

init.elを直接編集するのではなく、init.org経由で管理するようにしてみたが、
ついorg編集完了後にinit.elに反映するのを忘れがちになってしまう。

そのため、起動時にチェックしてinit.orgの方が新しかったら警告する。
本来は、保存時に自動でこの辺やってくれたほうがよい気はする。

最近、 `org-export-tangle` で完全一致の場合に上書きしてくれなくなった(もともとそうだっけ)ことに気付いたので、
別の手段でチェックする必要がありそうと思案中。

```emacs-lisp
(let ((my-init-org (concat user-emacs-directory "init.org"))
      (my-init-el (concat user-emacs-directory "init.el")))
  (when (file-newer-than-file-p my-init-org my-init-el)
    (message "WARN: init.el is old.\n")))
```


### GUIの見た目設定 {#guiの見た目設定}

ツールバーは使わないので消している。
メニューバーはときどき使うので残している。

Emacs26から登場したネイティブの行番号表示は、ddskkと相性が悪く
入力中に行がガタガタとずれてつらいので抑制している。

<https://www.grugrut.net/posts/201910202227/>

```emacs-lisp
;; ツールバーを表示しない
(tool-bar-mode 0)

;; スクロールバーを表示しない
(set-scroll-bar-mode nil)

;; 行番号を表示
(line-number-mode +1)
(column-number-mode +1)

;; 行番号表示(Emacs26以降)
(global-display-line-numbers-mode t)
(custom-set-variables '(display-line-numbers-width-start t))

;; タブ表示
(tab-bar-mode t)

;; native-compのワーニング抑制
(custom-set-variables '(warning-suppress-types '((comp))))
```


### フレームサイズ {#フレームサイズ}

```emacs-lisp
(setq default-frame-alist
      (append '((width                . 140)  ; フレーム幅
                (height               . 40 ) ; フレーム高
                (left                 . 170 ) ; 配置左位置
                (top                  . 30 ) ; 配置上位置
                (line-spacing         . 0  ) ; 文字間隔
                (left-fringe          . 12 ) ; 左フリンジ幅
                (right-fringe         . 12 ) ; 右フリンジ幅
                (menu-bar-lines       . 1  ) ; メニューバー
                (cursor-type          . box) ; カーソル種別
                (alpha                . 100) ; 透明度
                )
              default-frame-alist))
(setq initial-frame-alist default-frame-alist)
```


### カスタムファイル {#カスタムファイル}

`custom-set-variables` を利用すると、 `custom-file` に設定内容が書かれる。
これをロードしてしまうと、 `custom-ser-variables` よりも優先されて先に設定されてしまうため、
`init.el` を修正したつもりなのに昔の設定で動いてしまうことがある。

単なる優先順位の問題だが、そもそも読みこむ必要がないので不要なのだが、
定義はしておかないと起動時に文句を言われてしまうので設定だけして読まずに捨ててる。

```emacs-lisp
(custom-set-variables '(custom-file (expand-file-name "custom.el" user-emacs-directory)))
```


### early-init.el フッタ {#early-init-dot-el-フッタ}

```emacs-lisp
;;; early-init.el ends here

```


## init.el {#init-dot-el}


### ヘッダ {#ヘッダ}

```emacs-lisp
;;; init.el --- My init script -*- coding: utf-8 ; lexical-binding: t -*-

;; Author: grugrut
;; URL: https://github.com/grugrut/.emacs.d/init.el

;;; Commentary:

;;; Code:

```


### パッケージマネージャ {#パッケージマネージャ}


#### leaf.el {#leaf-dot-el}

以前は `use-package` + `straight.el` を使っていたが、
 `straight.el` は、会社のプロキシ環境下での相性が悪く、
パッケージ取得に失敗してしまうことが多くあきらめた。

現在は、 `leaf.el` を使っている。
`leaf.el` はuse-package経由で入れることでインストール部分がシンプルになるので修正

<https://a.conao3.com/blog/2024/7c7c265/>

過去にはOrgのインスールのために、Org Elpaを指定していたが、今はEmacs本体に含まれるようになったため、
ElpaとMelpaだけを指定している。

<https://orgmode.org/worg/org-release-notes.html#org1810cc6>

一部、MELPAに登録されていないパッケージを利用したくて、以前は `el-get` を使っていたが、
Emacs29から `package-vc-install` が使えるようになり、標準でソースからインストールできるようになったので、
`vc` キーワードに切り替えた。

```emacs-lisp
;; leaf.el
(eval-and-compile
  (customize-set-variable
   'package-archives '(("melpa" . "https://melpa.org/packages/")
                       ("gnu"   . "https://elpa.gnu.org/packages/")))
  (package-initialize)
  (use-package leaf :ensure t)

  (leaf leaf-keywords
    :ensure t
    :config
    ;; optional packages if you want to use :hydra, :el-get,,,
    (leaf hydra :ensure t)
    (leaf blackout :ensure t)

    ;; initialize leaf-keywords.el
    (leaf-keywords-init)))
```


### 一般設定 {#一般設定}


#### メモリ管理 {#メモリ管理}

```emacs-lisp
(leaf gcmh
  :ensure t
  :defun
  (gcmh-mode)
  :custom
  (gcmh-verbose . t)
  :init
  (gcmh-mode 1))
```


#### 変数設定 {#変数設定}

```emacs-lisp
(leaf general-settings
  :config
  (prefer-coding-system 'utf-8-unix)
  (setq read-answer-short t)
  (global-set-key [mouse-2] 'mouse-yank-at-click)
  (global-unset-key "\C-z")
  (delete-selection-mode t)
  (setq large-file-warning-threshold (* 25 1024 1024))
  (setq create-lockfiles nil)
  (setq history-length 500)
  (setq history-delete-duplicates t)
  (setq line-move-visual nil)
  (setq mouse-drag-copy-region t)
  (setq backup-inhibited t)
  (setq require-final-newline t)
  )
```


### 外観 {#外観}


#### フォント {#フォント}

テキスト表示には `Cica` を、絵文字には `nerd-icons` を利用する。
以前は `all-the-icons` を利用していたが乗り換えてみる。特に理由はない。

```emacs-lisp
(leaf :font
  :config
  ;; 絵文字インストール
  ;; (nerd-icons-install-fonts)
  (leaf nerd-icons
    :ensure t)
  ;; フォント設定
  ;; abcdefghik
  ;; 0123456789
  ;; あいうえお
  ;; 壱弐参四五
  (let* ((family "Cica")
         (fontspec (font-spec :family family :weight 'normal)))
    (set-face-attribute 'default nil :family family :height 120)
    (set-fontset-font nil 'ascii fontspec nil 'append)
    (set-fontset-font nil 'japanese-jisx0208 fontspec nil 'append)))
```


#### テーマ {#テーマ}

テーマのフレームワークは `doom` のものを利用している。
カラーテーマはダークテーマで色合いが気にいった `doom-vibrant` を使っているが、
そろそろ気分転換に他にしてもいいかもしれない。

```emacs-lisp
(leaf doom-themes
  :ensure t
  :defun (doom-themes-visual-bell-config)
  :config
  (load-theme 'doom-vibrant t)
  (doom-themes-visual-bell-config)
  (doom-themes-neotree-config)
  (doom-themes-org-config))
```


#### モードライン {#モードライン}

モードラインはDoom Modelineを使っている。

```emacs-lisp
(leaf doom-modeline
  :ensure t
  :defun
  (doom-modeline-mode)
  :init
  (doom-modeline-mode 1)
  :custom
  (doom-modeline-bar-width . 4)
  (doom-modeline-hud . t))
```


#### popwin {#popwin}

```emacs-lisp
(leaf popwin
  :ensure t
  :custom
  (popwin:popup-window-position . 'bottom))
```


#### beacon {#beacon}

```emacs-lisp
(leaf beacon
  :ensure t
  :defun
  (beacon-mode)
  :config
  (beacon-mode 1))
```


#### volatile-highlights {#volatile-highlights}

```emacs-lisp
(leaf volatile-highlights
  :ensure t
  :defun
  (volatile-highlithgs-mode)
  :global-minor-mode t)
```


### 編集 {#編集}


#### 日本語入力 {#日本語入力}

日本語入力には、みんな大好きskkを使っている。
AZIKも有効化する。

```emacs-lisp
(leaf ddskk
  :ensure t
  :bind
  (("C-x C-j" . skk-mode)
   ("C-x j"   . skk-mode))
  :init
  (defvar dired-bind-jump nil) ; dired-xに `C-x C-j` が奪われてしまうので対処
  :custom
  (skk-use-azik                      . t) ; AZIKを使用
  (skk-azik-keyboard-type            . 'jp106)
  (skk-server-host                   . "localhost")
  (skk-server-portnum                . 1178)
  (skk-egg-like-newline              . t) ; 変換時にはリータンで改行しない
  (skk-japanese-message-and-error    . t)
  (skk-auto-insert-paren             . t)
  (skk-check-okurigata-on-touroku    . t)
  (skk-show-annotation               . t)
  (skk-annotation-show-wikipedia-url . t)
  (skk-show-tooltip                  . nil)
  (skk-isearch-start-mode            . 'latin)
  (skk-henkan-okuri-strictly         . nil)
  (skk-process-okuri-early           . nil)
  (skk-status-indicator              . 'minior-mode))

```


#### Puni {#puni}

smartparensなどの後継として、Puniがよいとお勧めされたので使ってみる。

```emacs-lisp
(leaf puni
  :ensure t
  :defun
  (puni-global-mode)
  :config
  (puni-global-mode))
```


#### Vertico {#vertico}

```emacs-lisp
(leaf vertico
  :ensure t
  :global-minor-mode t
  :bind
  ((:vertico-map
    ("C-z" . vertico-insert)
    ("C-l" . grugrut/up-dir)))
  :preface
  (defun grugrut/up-dir ()
    "ひとつ上のディレクトリ階層に移動する."
    (interactive)
    (let* ((orig (minibuffer-contents))
           (orig-dir (file-name-directory orig))
           (up-dir (if orig-dir (file-name-directory (directory-file-name orig-dir))))
           (target (if (and up-dir orig-dir) up-dir orig)))
      (delete-minibuffer-contents)
      (insert target)))
  :custom
  (vertico-count . 20)
  (vertico-cycle . t))
```


#### savehist {#savehist}

```emacs-lisp
(leaf savehist
  :global-minor-mode t)
```


#### undo-tree {#undo-tree}

```emacs-lisp
(leaf undo-tree
  :ensure t
  :global-minor-mode global-undo-tree-mode)
```


#### orderless {#orderless}

```emacs-lisp
(leaf orderless
  :ensure t
  :custom
  (completion-styles . '(orderless)))
```


#### marginalia {#marginalia}

```emacs-lisp
(leaf marginalia
  :ensure t
  :global-minor-mode t)
```


#### consult {#consult}

```emacs-lisp
(leaf consult
  :ensure t
  :bind
  (([remap switch-to-buffer] . consult-buffer)
   ([remap goto-line] . consult-goto-line)
   ([remap yank-pop] . consult-yank-pop)
   ("C-;" . consult-buffer)))
```


#### embark {#embark}

```emacs-lisp
(leaf embark
  :ensure t
  :config
  (leaf embark-consult
    :ensure t
    :after consult))
```


#### Magit {#magit}

```emacs-lisp
(leaf magit
  :ensure t
  :bind
  (("C-x g" . magit-status)))
```


#### recentf {#recentf}

```emacs-lisp
(leaf recentf
  :init
  (recentf-mode)
  :config
  (setopt recentf-max-saved-items 5000)
  (setopt recentf-auto-cleanup 'never))
```


#### インデント表示 {#インデント表示}

もともと `highlight-indent-guide` を使っていたが、 `indent-bars` に乗り換えてみる。

```emacs-lisp
(leaf indent-bars
  :vc (:url "https://github.com/jdtsmith/indent-bars")
  :hook
  ((prog-mode) . indent-bars-mode)
  :config
  (require 'indent-bars-ts)
  :custom
  (indent-bars-treesit-support . t)
  (indent-bars-treesit-ignore-blank-lines-types . '("module")))
```


#### avy {#avy}

Vimの `f` に相当する。=Zap-to-Char= `M-z` でも、avyインタフェースで削除位置を指定する。

```emacs-lisp
(leaf avy
  :ensure t
  :bind
  (("C-:" . avy-goto-char-timer)
   ("C-*" . avy-resume)
   ("M-g M-g" . avy-goto-line))
  :config
  (leaf avy-zap
    :ensure t
    :bind
    ([remap zap-to-char] . avy-zap-to-char)))
```


#### Window切替 {#window切替}

カレントウィンドウを選択する。複数Windowある場合にわかりやすく切り替えられる。

```emacs-lisp
(leaf ace-window
  :ensure t
  :bind
  (("C-x o" . ace-window))
  :config
  (setopt aw-keys '(?a ?s ?d ?f ?g ?h ?i ?j ?k ?l))
  :custom-face
  (aw-leading-char-face . '((t (:height 3.0)))))
```


#### 検索 {#検索}

```emacs-lisp
(leaf anzu
  :ensure t
  :defun
  (global-anzu-mode)
  :bind
  (("M-%" . anzu-query-replace))
  :config
  (global-anzu-mode +1))
```


#### Migemo {#migemo}

```emacs-lisp
(leaf migemo
  :ensure t
  :require t
  :defun
  (migemo-init)
  :custom
  (migemo-command . "cmigemo")
  (migemo-options . '("-q" "--emacs"))
  (migemo-dictionary . "/usr/share/cmigemo/utf-8/migemo-dict")
  (migemo-user-dictionary . nil)
  (migemo-regex-dictionary . nil)
  (migemo-coding-system . 'utf-8-unix)
  :config
  (migemo-init))
```


#### Tree Sitter {#tree-sitter}

```emacs-lisp
(leaf treesit
  :config
  (setopt treesit-font-lock-level 4)
  (setopt treesit-language-source-alist
        '((bash "https://github.com/tree-sitter/tree-sitter-bash")
          (css "https://github.com/tree-sitter/tree-sitter-css")
          (elisp "https://github.com/Wilfred/tree-sitter-elisp")
          (go "https://github.com/tree-sitter/tree-sitter-go")
          (html "https://github.com/tree-sitter/tree-sitter-html")
          (javascript "https://github.com/tree-sitter/tree-sitter-javascript" "master" "src")
          (json "https://github.com/tree-sitter/tree-sitter-json")
          (markdown "https://github.com/ikatyang/tree-sitter-markdown")
          (toml "https://github.com/tree-sitter/tree-sitter-toml")
          (tsx "https://github.com/tree-sitter/tree-sitter-typescript" "master" "tsx/src")
          (typescript "https://github.com/tree-sitter/tree-sitter-typescript" "master" "typescript/src")
          (yaml "https://github.com/ikatyang/tree-sitter-yaml")))
)
```


#### LSP {#lsp}

```emacs-lisp
(leaf eglot
  :hook
  (html-mode . eglot-ensure)
  (go-mode . eglot-ensure)
  (typescript-mode . eglot-ensure)
  )
```


#### Corfu {#corfu}

```emacs-lisp
(leaf corfu
  :ensure t
  :defun
  (global-corfu-mode)
  :config
  (global-corfu-mode)
  :custom
  (corfu-cycle . t)
  (corfu-auto . t)
  (text-mode-ispell-word-completion . nil))
```


#### Cape {#cape}

```emacs-lisp
(leaf cape
  :ensure t)
```


#### Flymake {#flymake}

```emacs-lisp
(leaf flymake
  :global-minor-mode t)
```


### Org Mode {#org-mode}

Org Modeの設定。そこまで特殊な設定はいれていないが、
ソースコードブロックの編集に入る、編集を完了するキーバインドがデフォルトの `C-c C-'` が日本語キーボードだと入力しづらいので、
`C-c C-;` を使うように設定している。

Orgが9.7でexportがうまくうごかないので、9.6にダウングレードしている。

```emacs-lisp
(add-to-list 'load-path "~/.emacs.d/org-mode-release_9.6.30/lisp")

(leaf org
  :bind
  (("C-c c" . org-capture)
   ("C-c a" . org-agenda)
   ("C-c l" . org-store-link)
   (:org-mode-map
    ("C-c C-;" . org-edit-special))
   (:org-src-mode-map
    ("C-c C-;" . org-edit-src-exit)))
  :mode
  ("\\.org$'" . org-mode)
  :config
  (setopt org-directory "~/src/github.com/grugrut/PersonalProject/")
  :custom
  ;; TODOの状態繊維設定
  (org-todo-keywords . '((sequence "TODO(t)" "IN PROGRESS(i)" "|" "DONE(d)")
                         (sequence "WAITING(w@/!)" "HOLD(h@/!)" "|" "CANCELED(c@/!)" "MEETING")))
  (org-todo-keyword-faces . '(("TODO" :foreground "red" :weight bold)
                              ("IN PROGRESS" :foreground "cornflower blue" :weight bold)
                              ("DONE" :foreground "green" :weight bold)))
  (org-log-done . 'time)
  (org-clock-persist . t)
  (org-clock-out-when-done . t)
  (org-adapt-indentation . nil)
  (org-startup-folded . 'fold) 	; 初期表示を折り畳みにする
  )
```

```emacs-lisp
(leaf org-capture
  :after org
  :commands (org-capture)
  :defvar
  (org-directory)
  :config
  (defvar grugrut/org-inbox-file (concat org-directory "inbox.org"))
  (defvar grugrut/org-journal-file (concat org-directory "journal.org"))
  (setopt org-capture-templates `(
                                ("t" " Tasks" entry (file ,grugrut/org-inbox-file)
                                 "* TODO %? %^G\n:PROPERTIES:\n:DEADLINE: %^{Deadline}T\n:EFFORT: %^{effort|1:00|0:05|0:15|0:30|2:00|4:00}\n:END:\n")
                                ("e" " Event" entry (file ,grugrut/org-inbox-file)
                                 "* TODO %? %^G\n:PROPERTIES:\n:SCHEDULED: %^{Scheduled}T\n:EFFORT:%^{effort|1:00|0:05|0:15|0:30|2:00|4:00}\n:END:\n")
                                ("j" " Journal" entry (file+olp+datetree ,grugrut/org-journal-file)
                                 "* %<%H:%M> %?")
                                ("b" " blog" entry
                                 (file+headline "~/src/github.com/grugrut/blog/draft/blog.org" ,(format-time-string "%Y"))
                                 "** TODO %?\n:PROPERTIES:\n:EXPORT_HUGO_CUSTOM_FRONT_MATTER: :archives '(\\\"%(format-time-string \"%Y\")\\\" \\\"%(format-time-string \"%Y-%m\")\\\")\n:EXPORT_FILE_NAME: %(format-time-string \"%Y%m%d%H%M\")\n:END:\n\n")
                                )))
```


#### ox-hugo {#ox-hugo}

ブログをOrg Modeで書いて、ox-hugoでエクスポートしている。

```emacs-lisp
(leaf ox-hugo
  :ensure t
  :after ox
  :mode ("\\.org$'" . org-hugo-auto-export-mode))
```


### プログラミング言語 {#プログラミング言語}


#### Typescript {#typescript}

```emacs-lisp
(leaf typescript-mode
  :ensure t
  :mode
  (("\\.ts\\'" . typescript-mode)
   ("\\.tsx\\'" . tsx-ts-mode)))
```


### ユーティリティ {#ユーティリティ}


#### ブログ向けmarkdownへの変換 {#ブログ向けmarkdownへの変換}

ブログに紹介記事を書くように、このOrgファイルをMarkdownに変換する

```emacs-lisp
(defun grugrut/export-my-init-to-blog ()
  "Export as markdown for my blog post."
  (interactive)
  (require 'ox-hugo)
  (declare-function org-hugo-export-as-md "ox-hugo")
  (let ((file "~/src/github.com/grugrut/blog/content/posts/my-emacs-init-el.md"))
    (org-hugo-export-as-md)
    (write-file file t)))
```


#### Toast通知 {#toast通知}

WSLの世界から、母艦のWindowsに通知を発報するための自作パッケージ

```emacs-lisp
(leaf win-toast
  :vc (:url "https://github.com/grugrut/win-toast/"))
```


### フッタ {#フッタ}

```emacs-lisp
;;; init.el ends here
```
