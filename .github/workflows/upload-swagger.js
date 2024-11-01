module.exports = async ({ github }, publishedPackages, fs) => {
  const OWNER = "wealthsweet";
  const REPO = "open-source";
  const PACKAGE_NAME = "http-apis";

  console.log("Searching published packages: ", publishedPackages);
  const httpApiPackagePublish = publishedPackages.find(
    ({ name }) => name === `@${OWNER}/${PACKAGE_NAME}`,
  );
  if (!httpApiPackagePublish) {
    console.log(
      "No publish of http-api found. Skipping upload of swagger file to release assets.",
    );
    return;
  }
  console.log("Found publish of http-api: ", httpApiPackagePublish);
  console.log("Fetching release data from github API");
  const { data: githubRelease } = await github.rest.repos.getReleaseByTag({
    owner: OWNER,
    repo: REPO,
    tag: `${httpApiPackagePublish.name}@${httpApiPackagePublish.version}`,
  });
  console.log("Found release data: ", githubRelease);
  console.log("Uploading swagger file to release assets");
  await github.rest.repos.uploadReleaseAsset({
    owner: OWNER,
    repo: REPO,
    release_id: Number(githubRelease.id),
    name: "wealthsweet-swagger.yaml",
    label: "WealthSweet Swagger",
    data: fs
      .readFileSync("packages/http-apis/dist/swagger/performance.yaml")
      .toString("binary"),
  });
  console.log("Uploaded swagger file to release assets");
};
