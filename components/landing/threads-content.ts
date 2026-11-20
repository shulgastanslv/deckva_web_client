import type {
  ThreadsPostData,
  ThreadsReplyData,
} from "@/components/landing/threads-ui";

export const THREADS_CAROUSELS = {
  product: [
    "/landing/examples/1.png",
    "/landing/examples/2.png",
    "/landing/examples/3.png",
  ],
  launch: [
    "/landing/examples/4.png",
    "/landing/examples/5.png",
    "/landing/examples/6.png",
  ],
  tips: [
    "/landing/examples/7.png",
    "/landing/examples/8.png",
    "/landing/examples/9.png",
  ],
} as const;

export const THREADS_AVATAR = "/post_logo.jpg";

/** Spread carousel frame paths into `media`. */
export function frames(...src: string[]): string[] {
  return src;
}

/** One Threads post — fill only the fields you care about. */
export function post(data: ThreadsPostData): ThreadsPostData {
  return {
    ...data,
    avatar: data.avatar ?? THREADS_AVATAR,
    likes: data.likes ?? 0,
    replies: data.replies ?? 0,
  };
}

/** One reply under a post. */
export function reply(data: ThreadsReplyData): ThreadsReplyData {
  return {
    ...data,
    avatar: data.avatar ?? THREADS_AVATAR,
  };
}

/** Hero phone pair — front (featured) + back (peek). */
export type HeroThreadsCopy = {
  front: { text: string; time: string; topic?: string };
  back: { text: string; time: string };
  comments: {
    c1: { text: string; time: string };
    c1r1: { text: string; time: string };
    c2: { text: string; time: string };
    b1: { text: string; time: string };
  };
};

export function heroThreadsPosts(copy: HeroThreadsCopy): {
  front: ThreadsPostData[];
  back: ThreadsPostData[];
} {
  return {
    front: [
      post({
        id: "hero-front",
        author: "deckva",
        verified: true,
        liked: true,
        topic: copy.front.topic,
        text: copy.front.text,
        time: copy.front.time,
        media: [...THREADS_CAROUSELS.product],
        likes: "12.4K",
        replies: "486",
        reposts: "1.2K",
        insights: true,
        comments: [
          reply({
            id: "hero-c1",
            author: "deckva",
            time: copy.comments.c1.time,
            text: copy.comments.c1.text,
            likes: "892",
            replies: "24",
            liked: true,
            showFollow: true,
            children: [
              reply({
                id: "hero-c1-r1",
                author: "deckva",
                time: copy.comments.c1r1.time,
                text: copy.comments.c1r1.text,
                isAuthor: true,
                likes: "214",
              }),
            ],
          }),
          reply({
            id: "hero-c2",
            author: "deckva",
            time: copy.comments.c2.time,
            text: copy.comments.c2.text,
            likes: "341",
            showTranslate: true,
          }),
        ],
      }),
    ],
    back: [
      post({
        id: "hero-back",
        author: "deckva",
        text: copy.back.text,
        time: copy.back.time,
        media: [...THREADS_CAROUSELS.launch],
        likes: "4.8K",
        replies: "128",
        reposts: "312",
        liked: true,
        insights: true,
        comments: [
          reply({
            id: "hero-b-c1",
            author: "deckva",
            time: copy.comments.b1.time,
            text: copy.comments.b1.text,
            likes: "156",
            liked: true,
          }),
        ],
      }),
    ],
  };
}
