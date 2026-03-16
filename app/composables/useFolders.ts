export function useFolders() {
  const selectedFolder = useState<string | null>("selectedFolder", () => null);
  const {
    data: folders,
    status,
    error,
    refresh,
  } = useFetch("/api/folders", { key: "folders" });

  watch(
    folders,
    (val) => {
      if (val?.length && !selectedFolder.value) {
        selectedFolder.value = val[0]!.prefix;
      }
    },
    { immediate: true },
  );

  function selectFolder(prefix: string) {
    selectedFolder.value = prefix;
  }

  async function createFolder(name: string): Promise<string> {
    const result = await $fetch("/api/folders", {
      method: "POST",
      body: { name },
    });
    await refresh();
    selectedFolder.value = result.prefix;
    return result.prefix;
  }

  async function generateUploadToken(folder: string, expiresIn: number) {
    return await $fetch("/api/upload-tokens", {
      method: "POST",
      body: { folder, expiresIn },
    });
  }

  return {
    folders,
    selectedFolder,
    status,
    error,
    selectFolder,
    createFolder,
    generateUploadToken,
    refresh,
  };
}
