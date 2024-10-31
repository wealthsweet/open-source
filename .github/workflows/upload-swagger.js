module.exports = async ({ github }, publishedPackages) => {
  console.log("publishedPackages: ", publishedPackages);
  const packages = JSON.parse(publishedPackages);
  const uploadUrl = packages.find(
    ({ name }) => name == "@wealthsweet/http-apis",
  ).uploadUrl;
  console.log("uploadUrl: ", uploadUrl);
  const regex =
    /https:\/\/uploads\.github\.com\/repos\/([^/]+)\/([^/]+)\/releases\/(\d+)\/assets(?:\?name=([^&]+))?(?:&label=([^&]+))?/;
  const match = regex.exec(uploadUrl);
  if (match) {
    const data = {
      owner: match[1],
      repo: match[2],
      releaseId: match[3],
    };
    console.log(data);
    await github.rest.repos.uploadReleaseAsset({
      owner: data.owner,
      repo: data.repo,
      release_id: Number(data.releaseId),
      name: "Swagger Documentation",
      label: "swagger",
      data: fs
        .readFileSync("packages/http-apis/dist/swagger/performance.yaml")
        .toString("binary"),
    });
  } else {
    console.log("No match found");
  }
};
