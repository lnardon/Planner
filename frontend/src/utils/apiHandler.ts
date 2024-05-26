export const apiHandler = async (
  url: string,
  method: string,
  contentType: string,
  body?: string
) => {
  const options: {
    method: string;
    headers: {
      Authorization: string;
      "Content-Type": string;
    };
    body?: string;
  } = {
    method: method,
    headers: {
      Authorization: localStorage.getItem("token") || "",
      "Content-Type": contentType,
    },
  };

  if (method === "POST") {
    options.body = body;
  }

  const raw = await fetch(url, options);

  if (raw.status === 401) {
    sessionStorage.removeItem("token");
    window.location.href = "/";
    window.location.reload();
  }

  return raw;
};
