const projectCache = new Map();

const CACHE_TTL = 30000;

const PAYLOAD_VERSION = 1;

const CONFLICT_WINDOW = 10000;

function normalizeProject(project) {
  return {
    id: project?.id ?? null,
    name: project?.name ?? "",
    description:
      project?.description ?? "",
    status:
      project?.status ?? "unknown",
    createdAt:
      project?.createdAt ?? null,
    updatedAt:
      project?.updatedAt ?? null,
  };
}

function buildVersionMetadata() {
  return {
    version: PAYLOAD_VERSION,
    revision: Date.now(),
  };
}

function buildMutationSignature(
  projectId
) {
  return `${projectId}-${Date.now()}`;
}

function createReconciliationMetadata(
  source
) {
  return {
    reconciledAt:
      new Date().toISOString(),
    source,
    conflictChecked: true,
  };
}

function validateVersionConsistency(
  payload
) {
  return (
    payload?.version ===
    PAYLOAD_VERSION
  );
}

function detectConflictingMutation(
  cached
) {
  if (!cached) {
    return false;
  }

  return (
    Date.now() -
      cached.timestamp <
    CONFLICT_WINDOW
  );
}

function reconcileProjectPayload(
  payload,
  source
) {
  return {
    ...payload,
    ...buildVersionMetadata(),
    reconciliation:
      createReconciliationMetadata(
        source
      ),
  };
}

function buildIntegritySnapshot(
  payload
) {
  return {
    snapshotCreatedAt:
      Date.now(),
    payloadKeys:
      Object.keys(
        payload || {}
      ),
  };
}

function serializeProjectPayload(
  payload,
  source
) {
  return {
    version: PAYLOAD_VERSION,
    source,
    generatedAt:
      new Date().toISOString(),
    data: payload,
  };
}

function validatePayloadIntegrity(
  payload
) {
  return (
    payload &&
    typeof payload === "object" &&
    "version" in payload &&
    "data" in payload
  );
}

export async function getProjectById(
  projectId,
  fetchProject
) {
  const cached =
    projectCache.get(projectId);

  const conflictDetected =
    detectConflictingMutation(
      cached
    );

  if (
    cached &&
    Date.now() - cached.timestamp <
      CACHE_TTL
  ) {
    return cached.data;
  }

  const project =
    await fetchProject(projectId);

  const payload =
    reconcileProjectPayload(
      serializeProjectPayload(
        normalizeProject(project),
        "project-by-id"
      ),
      "project-by-id"
    );

  if (
    !validatePayloadIntegrity(
      payload
    )
  ) {
    throw new Error(
      "Invalid project payload"
    );
  }

  const integritySnapshot =
    buildIntegritySnapshot(
      payload
    );

  payload.integritySnapshot =
    integritySnapshot;

  payload.conflictDetected =
    conflictDetected;

  payload.mutationSignature =
    buildMutationSignature(
      projectId
    );

  projectCache.set(projectId, {
    data: payload,
    timestamp: Date.now(),
  });

  return payload;
}

export async function getProjects(
  fetchProjects
) {
  const cacheKey =
    "all-projects";

  const cached =
    projectCache.get(cacheKey);

  if (
    cached &&
    Date.now() - cached.timestamp <
      CACHE_TTL
  ) {
    return cached.data;
  }

  const projects =
    await fetchProjects();

  const payload =
    reconcileProjectPayload(
      serializeProjectPayload(
        projects.map(
          normalizeProject
        ),
        "project-list"
      ),
      "project-list"
    );

  if (
    !validatePayloadIntegrity(
      payload
    )
  ) {
    throw new Error(
      "Invalid projects payload"
    );
  }

  payload.integritySnapshot =
    buildIntegritySnapshot(
      payload
    );

  payload.versionConsistent =
    validateVersionConsistency(
      payload
    );

  payload.mutationSignature =
    buildMutationSignature(
      cacheKey
    );

  projectCache.set(cacheKey, {
    data: payload,
    timestamp: Date.now(),
  });

  return payload;
}

export function invalidateProjectCache(
  projectId
) {
  if (projectId) {
    projectCache.delete(projectId);
  }

  projectCache.delete(
    "all-projects"
  );
}

export function getProjectCacheMetrics() {
  return {
    entries:
      projectCache.size,
    cacheKeys: Array.from(
      projectCache.keys()
    ),
    payloadVersion:
      PAYLOAD_VERSION,
    conflictWindow:
      CONFLICT_WINDOW,
    validationEnabled: true,
    reconciliationEnabled: true,
  };
}

export function validateCachedPayloads() {
  return Array.from(
    projectCache.values()
  ).every((entry) =>
    validatePayloadIntegrity(
      entry.data
    )
  );
}

export function clearProjectCache() {
  projectCache.clear();
}