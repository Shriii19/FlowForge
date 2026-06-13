const projectCache = new Map();

const CACHE_TTL = 30000;

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

  projectCache.set(projectId, {
    data: project,
    timestamp: Date.now(),
  });

  return project;
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

  projectCache.set(cacheKey, {
    data: projects,
    timestamp: Date.now(),
  });

  return projects;
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

export function clearProjectCache() {
  projectCache.clear();
}