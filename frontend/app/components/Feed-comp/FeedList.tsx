import FeedItem from "./FeedItem";

export type FeedActivityType = "code" | "discussion" | "milestone";

export type FeedActivityItem = {
  id: string;
  type: FeedActivityType;
  actor: string;
  action: string;
  title: string;
  body: string;
  time: string;
  group: string;
  meta: string;
  image: string | null;
  progress: number | null;
};

type FeedListProps = {
  items: FeedActivityItem[];
  totalCount: number;
  onLoadMore: () => void;
};

export default function FeedList({ items, totalCount, onLoadMore }: FeedListProps) {
  const groupedItems = items.reduce<Record<string, FeedActivityItem[]>>((acc, item) => {
    acc[item.group] = [...(acc[item.group] || []), item];
    return acc;
  }, {});

  return (
    <>
      {Object.entries(groupedItems).map(([group, groupItems]) => (
        <section key={group} className="space-y-gutter">
          <div className="flex items-center gap-4 py-4">
            <span className="font-label-md text-label-md text-outline uppercase tracking-widest">{group}</span>
            <div className="h-px bg-outline-variant flex-1" />
          </div>

          {groupItems.map((item) => (
            <FeedItem key={item.id} item={item} />
          ))}
        </section>
      ))}

      {items.length === 0 && (
        <div className="glass-card rounded-xl p-10 text-center text-on-surface-variant">
          No activity matches the current filters.
        </div>
      )}

      {items.length < totalCount && (
        <div className="flex justify-center py-12">
          <button
            type="button"
            onClick={onLoadMore}
            className="px-8 py-3 border border-outline-variant text-primary font-label-md text-label-md rounded-full hover:bg-white hover:shadow-sm transition-all duration-300"
          >
            Load older activity
          </button>
        </div>
      )}
    </>
  );
}
