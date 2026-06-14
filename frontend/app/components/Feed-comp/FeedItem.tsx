import { memo, useMemo } from "react";
import type { FeedActivityItem } from "./FeedList";

const typeIcon = {
  code: "code",
  discussion: "forum",
  milestone: "flag",
};

type FeedItemProps = {
  item: FeedActivityItem;
};

type FeedContentModel = {
  icon: string;
  hasProgress: boolean;
  progressLabel: string;
  metaLabel: string;
};

type FeedRenderMetrics = {
  contentLength: number;
  hasImage: boolean;
};

function buildContentModel(
  item: FeedActivityItem
): FeedContentModel {
  return {
    icon: typeIcon[item.type],
    hasProgress:
      typeof item.progress ===
      "number",
    progressLabel: `${item.progress ?? 0}% complete`,
    metaLabel:
      item.meta ?? "",
  };
}

function buildRenderMetrics(
  item: FeedActivityItem
): FeedRenderMetrics {
  return {
    contentLength:
      item.body.length,
    hasImage:
      Boolean(item.image),
  };
}

const FeedActions = memo(
  function FeedActions() {
    return (
      <div className="flex flex-wrap gap-4">
        <button
          className="flex items-center gap-1.5 text-primary font-label-md text-label-md hover:underline"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            visibility
          </span>
          View Details
        </button>

        <button
          className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md hover:text-primary"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            reply
          </span>
          Reply
        </button>
      </div>
    );
  }
);

function FeedItem({
  item,
}: FeedItemProps) {
  const contentModel =
    useMemo(
      () =>
        buildContentModel(
          item
        ),
      [item]
    );

  const renderMetrics =
    useMemo(
      () =>
        buildRenderMetrics(
          item
        ),
      [item]
    );

  return (
    <article className="glass-card rounded-xl p-card-padding flex gap-6 relative group transition-all hover:shadow-lg">
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-white bg-primary-container flex items-center justify-center text-on-primary-container">
        {item.image ? (
          <img
            alt={item.actor}
            className="w-full h-full object-cover"
            src={item.image}
          />
        ) : (
          <span
            className="material-symbols-outlined"
            style={{
              fontVariationSettings:
                "'FILL' 1",
            }}
          >
            {
              contentModel.icon
            }
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-1 mb-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-body-md text-body-md font-bold text-on-surface">
            {item.actor}{" "}
            <span className="font-normal text-on-surface-variant">
              {item.action}
            </span>
          </h3>

          <time className="font-label-md text-label-md text-outline">
            {item.time}
          </time>
        </div>

        <div className="border border-outline-variant/30 rounded-lg p-4 mb-4 bg-white/60">
          <div className="flex items-center gap-3 text-primary mb-1">
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  "'FILL' 1",
              }}
            >
              {
                contentModel.icon
              }
            </span>

            <span className="font-body-md font-semibold">
              {item.title}
            </span>
          </div>

          <p className="text-on-surface-variant text-body-md">
            {item.body}
          </p>

          {contentModel.hasProgress && (
            <div className="mt-4">
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all"
                  style={{
                    width: `${item.progress}%`,
                  }}
                />
              </div>

              <div className="flex justify-between mt-2 font-label-md text-label-md text-on-surface-variant">
                <span>
                  {
                    contentModel.progressLabel
                  }
                </span>

                <span>
                  {
                    contentModel.metaLabel
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        <FeedActions />
      </div>

      <div
        className="hidden"
        data-content-length={
          renderMetrics.contentLength
        }
        data-has-image={
          renderMetrics.hasImage
        }
      />
    </article>
  );
}

export default memo(FeedItem);