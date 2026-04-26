export const displayName = (name: string): string =>
  name
    .replaceAll("-", " ")
    .replace(/^OpenAI (?=o|gpt)/i, "")
    .replace(/^Meta Llama/, "Llama")
    .replace("gpt", "GPT")
    .replace(/\bMini\b/, "mini")
    .replace(/GPT OSS/i, "gpt oss")
    .replace(/\bV(?=[0-9])/, "v")
    .replace(
      /(?<= (?:1|3|4|7|8|11|12|14|17|22|26|27|30|31|32|70|72|80|90|120|235|397|405|480))B/,
      "b",
    )
    .replace(/(?<= (?:1))T/, "t")
    .replace(/(?<=A(?:3|4|17|22|35))B/, "b")
    .replace(" A22b", "")
    .replace(/3n ([0-9]+)b/i, "3n E$1b")
    .replace(/ preview| \(preview\)/i, "")
    .replace(/(?<=Mistral Small.+) 24b/i, "")
    .replace(/\b([01][0-9]) 20(2[0-9])\b/, "$2$1")
    .replace(/(?<=\b2[0-9])\.(?=[01][0-9]\b)/, "")
    .replace(/^Qwen3 (.*) 2507\b/, "Qwen3.1 $1")
    .replace(/\bReasoner\b/, "Thinking")
    .replace(/\bThink\b/, "Thinking")
    .replace(/^(.+) Thinking (.+)$/, "$1 $2 Thinking")
    .replace(/ instruct$/i, "")
    .replace(/ 17b 128e instruct fp8$/i, "")
    .replace(/ 17b 128e$/i, "")
    .replace(/ 17b 16e instruct$/i, "")
    .replace(/ 17b 16e$/i, "")
    .replace(/(?<=3\.2.+) Vision$/, "");
