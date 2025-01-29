interface NetworkProfile {
  displayName: string;
  bio: string;
  channels: Array<{
    type: string;
    visibility: string;
    isVerified: boolean;
    value: string;
  }>;
  connectionDate: string;
}

interface NetworkData {
  profiles: NetworkProfile[];
}

interface AnalysisResult {
  name: string;
  explanation: string;
}

export const filterProfileData = (profiles: NetworkData["profiles"]) => {
  return profiles.map((profile) => ({
    displayName: profile.displayName,
    bio: profile.bio,
    channels: profile.channels
      .filter((channel) => channel.visibility === "public")
      .map(({ type, value }) => ({ type, value })),
    connectionDate: profile.connectionDate,
  }));
};

export const analyzeNetwork = async (
  apiKey: string,
  networkData: NetworkData,
  prompt: string
): Promise<AnalysisResult[]> => {
  const filteredProfiles = filterProfileData(networkData.profiles);
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional network analyst.",
        },
        {
          role: "user",
          content: `Given these network profiles: ${JSON.stringify(
            filteredProfiles
          )}\n\n${prompt}\n\nRespond with nothing else but a json array of { name: string; explanation: string} with no formatting or line breaks.`,
        },
      ],
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};