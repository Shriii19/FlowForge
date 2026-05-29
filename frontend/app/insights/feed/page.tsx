"use client";

import { useEffect, useMemo, useState } from "react";
import FeedHeader, { type FeedFilter } from "@/app/components/Feed-comp/FeedHeader";
import FeedList, { type FeedActivityItem } from "@/app/components/Feed-comp/FeedList";
import FeedMobileNav from "@/app/components/Feed-comp/FeedMobileNav";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const fallbackItems: FeedActivityItem[] = [
  {
    id: "fallback-deploy",
    type: "code",
    actor: "Alex Rivera",
    action: "deployed to production",
    title: "Production Environment: v2.4.0-rc1",
    body: "Successfully deployed 14 services and updated the global edge configuration.",
    time: "2 hours ago",
    group: "Today",
    meta: "Deployment",
    image: "https://i.pravatar.cc/96?img=21",
    progress: null,
  },
  {
    id: "fallback-comment",
    type: "discussion",
    actor: "James Wilson",
    action: "commented on a task",
    title: "Heatmap spacing",
    body: "The insights heatmap needs more padding around the legend on compact displays.",
    time: "Yesterday",
    group: "Yesterday",
    meta: "Discussion",
    image: "https://i.pravatar.cc/96?img=22",
    progress: null,
  },
];

export default function InsightsFeedPage() {
  const [items, setItems] = useState<FeedActivityItem[]>(fallbackItems);
  const [filter, setFilter] = useState<FeedFilter>("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeed() {
      setIsLoading(true);
      setStatus("");
      try {
        const response = await fetch(`${API_URL}/api/feed`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to load feed");
        const body = (await response.json()) as { items: FeedActivityItem[] };
        setItems(body.items.length > 0 ? body.items : fallbackItems);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setStatus("Showing local activity because the backend feed is unavailable.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadFeed();
    return () => controller.abort();
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Code" && item.type === "code") ||
        (filter === "Discussion" && item.type === "discussion") ||
        (filter === "Milestones" && item.type === "milestone");
      const matchesQuery =
        !normalizedQuery ||
        [item.actor, item.action, item.title, item.body, item.meta].some((value) =>
          String(value || "").toLowerCase().includes(normalizedQuery)
        );
      return matchesFilter && matchesQuery;
    });
  }, [filter, items, query]);

  const createInsight = async () => {
    const title = window.prompt("Insight title");
    if (!title?.trim()) return;
    const body = window.prompt("Insight details");
    if (!body?.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), type: "discussion" }),
      });
      if (!response.ok) throw new Error("Failed to create insight");
      const result = (await response.json()) as { item: FeedActivityItem };
      setItems((current) => [result.item, ...current]);
      setStatus("Insight added to the backend feed.");
    } catch {
      const localItem: FeedActivityItem = {
        id: `local-${Date.now()}`,
        type: "discussion",
        actor: "You",
        action: "created a local insight",
        title: title.trim(),
        body: body.trim(),
        time: "Just now",
        group: "Today",
        meta: "Local draft",
        image: null,
        progress: null,
      };
      setItems((current) => [localItem, ...current]);
      setStatus("Backend was unavailable, so this insight was added locally.");
    }
  };

  return (
    <>
      <FeedHeader
        activeFilter={filter}
        query={query}
        isLoading={isLoading}
        status={status}
        onCreateInsight={createInsight}
        onFilterChange={setFilter}
        onQueryChange={setQuery}
      />

      <div className="flex-1 overflow-y-auto px-4 md:px-margin-desktop py-gutter">
        <div className="max-w-4xl mx-auto space-y-gutter pb-20 md:pb-8">
          <FeedList
            items={filteredItems.slice(0, visibleCount)}
            totalCount={filteredItems.length}
            onLoadMore={() => setVisibleCount((count) => count + 4)}
          />
        </div>
      </div>
      <FeedMobileNav />
    </>
  );
}
