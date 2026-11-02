import { Eye, Heart, MessageSquare, Plus, Reply, ThumbsUp } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import {
  loadComments,
  loadLikedIds,
  loadReactions,
  relativeTime,
  saveComment,
  seedComments,
  seedReactions,
  toggleCommentLike,
  toggleReaction,
  type Comment,
  type ReactionKey,
  type ReactionState,
} from "@/lib/comments";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

function GiscusEmbed() {
  const cfg = site.comments.giscus;
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", cfg.repo);
    script.setAttribute("data-repo-id", cfg.repoId);
    script.setAttribute("data-category", cfg.category);
    script.setAttribute("data-category-id", cfg.categoryId);
    script.setAttribute("data-mapping", cfg.mapping);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", cfg.theme);
    script.setAttribute("data-lang", cfg.lang);
    const host = document.getElementById("giscus-host");
    if (!host) return;
    host.innerHTML = "";
    host.appendChild(script);
  }, [cfg]);
  return <div id="giscus-host" className="mt-6" />;
}

export function CommentSection({ slug }: { slug: string }) {
  const useGiscus =
    site.comments.provider === "giscus" && Boolean(site.comments.giscus.repo);

  return (
    <section className="border-t border-hairline pt-12" aria-labelledby="comments-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.14em] text-muted">讨论</p>
          <h2 id="comments-title" className="mt-1 font-display text-3xl tracking-[-0.03em] text-ink">
            评论
          </h2>
        </div>
        <p className="max-w-[14rem] text-right text-xs leading-5 text-muted">
          {useGiscus
            ? "由 Giscus 驱动，评论写入 GitHub Discussions。"
            : "开源风格讨论串。可切换为 Giscus。"}
        </p>
      </div>
      {useGiscus ? <GiscusEmbed /> : <LocalThread slug={slug} />}
    </section>
  );
}

function LocalThread({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>(() => seedComments(slug));
  const [liked, setLiked] = useState<string[]>([]);
  const [reactions, setReactions] = useState<ReactionState>(() => seedReactions(slug));
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    setComments(loadComments(slug));
    setLiked(loadLikedIds());
    setReactions(loadReactions(slug));
    setReplyTo(null);
  }, [slug]);

  const roots = useMemo(
    () => comments.filter((c) => c.parentId === null),
    [comments],
  );

  function childrenOf(id: string) {
    return comments.filter((c) => c.parentId === id);
  }

  function onPosted(comment: Comment) {
    setComments((prev) => [...prev, comment]);
    setReplyTo(null);
    toast.success("评论已发布");
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2">
        <ReactionChip
          icon={<Plus className="size-3.5" strokeWidth={2.2} />}
          label="共鸣"
          active={reactions.plus.mine}
          count={reactions.plus.count}
          onClick={() => setReactions(toggleReaction(slug, "plus" satisfies ReactionKey))}
        />
        <ReactionChip
          icon={<Heart className="size-3.5" />}
          label="喜欢"
          active={reactions.heart.mine}
          count={reactions.heart.count}
          onClick={() => setReactions(toggleReaction(slug, "heart"))}
        />
        <ReactionChip
          icon={<Eye className="size-3.5" />}
          label="看过"
          active={reactions.eyes.mine}
          count={reactions.eyes.count}
          onClick={() => setReactions(toggleReaction(slug, "eyes"))}
        />
      </div>

      <Composer slug={slug} parentId={null} onPosted={onPosted} />

      <ol className="mt-10 space-y-8">
        {roots.length === 0 ? (
          <li className="rounded-lg bg-surface-card px-5 py-6 text-sm text-muted">
            还没有评论。先留一句真实的话。
          </li>
        ) : (
          roots.map((comment) => (
            <li key={comment.id}>
              <CommentItem
                comment={comment}
                liked={liked.includes(comment.id)}
                onLike={() => setLiked(toggleCommentLike(comment.id))}
                onReply={() => setReplyTo(comment.id)}
              />
              <ol className="mt-4 ml-0 space-y-4 border-l border-hairline pl-5 sm:ml-4">
                {childrenOf(comment.id).map((child) => (
                  <li key={child.id}>
                    <CommentItem
                      comment={child}
                      liked={liked.includes(child.id)}
                      onLike={() => setLiked(toggleCommentLike(child.id))}
                      compact
                    />
                  </li>
                ))}
              </ol>
              {replyTo === comment.id ? (
                <div className="mt-4 sm:ml-4">
                  <Composer
                    slug={slug}
                    parentId={comment.id}
                    onPosted={onPosted}
                    onCancel={() => setReplyTo(null)}
                    autoFocus
                  />
                </div>
              ) : null}
            </li>
          ))
        )}
      </ol>
    </div>
  );
}

function ReactionChip({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-150",
        active
          ? "bg-primary text-on-primary"
          : "bg-surface-card text-body hover:bg-surface-cream",
      )}
    >
      {icon}
      {label}
      <span className="tabular-nums">{count}</span>
    </button>
  );
}

function CommentItem({
  comment,
  liked,
  onLike,
  onReply,
  compact,
}: {
  comment: Comment;
  liked: boolean;
  onLike: () => void;
  onReply?: () => void;
  compact?: boolean;
}) {
  const extra = liked ? 1 : 0;
  return (
    <article>
      <div className="flex items-center gap-2">
        <span
          className="inline-flex size-8 items-center justify-center rounded-full bg-surface-cream font-display text-sm text-ink"
          aria-hidden="true"
        >
          {comment.author.slice(0, 1)}
        </span>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-medium text-ink">{comment.author}</span>
          <time className="text-xs text-muted" dateTime={new Date(comment.createdAt).toISOString()}>
            {relativeTime(comment.createdAt)}
          </time>
        </div>
      </div>
      <p
        className={cn(
          "mt-2 whitespace-pre-wrap text-body",
          compact ? "text-[15px] leading-6" : "text-[16px] leading-[1.65]",
        )}
      >
        {comment.body}
      </p>
      <div className="mt-2 flex items-center gap-1">
        <button
          type="button"
          onClick={onLike}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium",
            liked ? "text-primary" : "text-muted hover:text-ink",
          )}
        >
          <ThumbsUp className="size-3.5" />
          <span className="tabular-nums">{comment.likes + extra}</span>
        </button>
        {onReply ? (
          <button
            type="button"
            onClick={onReply}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted hover:text-ink"
          >
            <Reply className="size-3.5" />
            回复
          </button>
        ) : null}
      </div>
    </article>
  );
}

function Composer({
  slug,
  parentId,
  onPosted,
  onCancel,
  autoFocus,
}: {
  slug: string;
  parentId: string | null;
  onPosted: (comment: Comment) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = body.trim();
    if (text.length < 2) {
      toast.error("请写两句再发布");
      return;
    }
    if (text.length > 800) {
      toast.error("评论请控制在 800 字内");
      return;
    }
    const comment = saveComment({
      slug,
      parentId,
      author: author.replace(/[<>]/g, "").slice(0, 24),
      body: text.replace(/[<>]/g, ""),
    });
    onPosted(comment);
    setBody("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "rounded-lg bg-surface-card p-4 sm:p-5",
        parentId ? "mt-0" : "mt-8",
      )}
    >
      <label className="block text-xs font-medium tracking-[0.08em] text-muted">
        {parentId ? "回复" : "写下你的看法"}
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr]">
        <input
          type="text"
          name="author"
          maxLength={24}
          placeholder="署名（可空）"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="h-11 rounded-md border border-hairline bg-canvas px-3 text-sm text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none"
        />
        <textarea
          name="body"
          required
          rows={parentId ? 3 : 4}
          maxLength={800}
          placeholder="不需要客套。直接说哪一句对、哪一句不准。"
          value={body}
          autoFocus={autoFocus}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-[6rem] resize-y rounded-md border border-hairline bg-canvas px-3 py-2.5 text-sm leading-6 text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none"
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <MessageSquare className="size-3.5" />
          {parentId ? "回复会跟在这条下面" : "评论保存在此浏览器，可随时改接 Giscus"}
        </p>
        <div className="flex gap-2">
          {onCancel ? (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              取消
            </Button>
          ) : null}
          <Button type="submit" size="sm">
            发布
          </Button>
        </div>
      </div>
    </form>
  );
}
