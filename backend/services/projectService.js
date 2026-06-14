const projectCache = new Map();

const CACHE_TTL = 30000;

const PAYLOAD_VERSION = 1;

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
    serializeProjectPayload(
      normalizeProject(project),
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
    serializeProjectPayload(
      projects.map(
        normalizeProject
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