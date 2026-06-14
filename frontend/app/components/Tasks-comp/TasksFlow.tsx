import React, { useMemo } from "react";

export type TaskFlowNode = {
  label: string;
  sub: string;
  value: number;
  active: boolean;
};

type WorkflowNode = TaskFlowNode & {
  position: number;
  isTerminal: boolean;
};

type WorkflowConnection = {
  id: string;
  active: boolean;
};

type TaskFlowProps = {
  nodes: TaskFlowNode[];
};

function buildWorkflowNodes(
  nodes: TaskFlowNode[]
): WorkflowNode[] {
  return nodes.map(
    (node, index) => ({
      ...node,
      position: index + 1,
      isTerminal:
        index === nodes.length - 1,
    })
  );
}

function buildWorkflowConnections(
  nodes: TaskFlowNode[]
): WorkflowConnection[] {
  return nodes
    .slice(0, -1)
    .map((node, index) => ({
      id: `${node.label}-${index}`,
      active: node.active,
    }));
}

export default function TaskFlow({
  nodes,
}: TaskFlowProps) {
  const workflowNodes = useMemo(
    () => buildWorkflowNodes(nodes),
    [nodes]
  );

  const workflowConnections =
    useMemo(
      () =>
        buildWorkflowConnections(
          workflowNodes
        ),
      [workflowNodes]
    );

  const activeStages = useMemo(
    () =>
      workflowNodes.filter(
        (node) => node.active
      ).length,
    [workflowNodes]
  );

  return (
    <div className="py-12 px-8 relative bg-transparent">
      <div className="mb-8 flex justify-center">
        <div
          className="
            rounded-full
            bg-surface-container-low
            px-4 py-2
            text-xs
            font-medium
          "
        >
          {activeStages}
          {" / "}
          {workflowNodes.length}
          {" active stages"}
        </div>
      </div>

      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-outline-variant/40 -translate-y-1/2" />

      <div className="relative flex justify-between items-center max-w-4xl mx-auto">
        {workflowNodes.map(
          (node, index) => (
            <React.Fragment
              key={node.label}
            >
              <div className="flex flex-col items-center gap-4 relative z-10 group">
                <div
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${
                    node.active
                      ? "border-primary bg-primary-container/20 shadow-lg shadow-primary/10 group-hover:scale-110"
                      : "border-outline-variant bg-surface group-hover:border-primary"
                  }`}
                >
                  <span
                    className={`font-data-viz text-[16px] font-bold ${
                      node.active
                        ? "text-primary"
                        : "text-on-surface"
                    }`}
                  >
                    {node.value}
                  </span>
                </div>

                <div className="text-center">
                  <p
                    className={`font-label-md text-[12px] font-bold uppercase tracking-wider ${
                      node.active
                        ? "text-primary"
                        : "text-on-surface"
                    }`}
                  >
                    {node.label}
                  </p>

                  <p
                    className={`font-data-viz text-[10px] ${
                      node.active
                        ? "text-primary/60"
                        : "text-outline"
                    }`}
                  >
                    {node.sub}
                  </p>
                </div>
              </div>

              {!node.isTerminal && (
                <div
                  className={`flex-1 h-[2px] mx-4 opacity-50 ${
                    workflowConnections[
                      index
                    ]?.active
                      ? "bg-gradient-to-r from-primary/30 to-outline-variant"
                      : "bg-outline-variant/40"
                  }`}
                />
              )}
            </React.Fragment>
          )
        )}
      </div>
    </div>
  );
}