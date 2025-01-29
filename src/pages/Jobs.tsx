import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import ResultsList from "@/components/ResultsList";
import { useToast } from "@/components/ui/use-toast";
import { DEFAULT_JOB_DESCRIPTION } from "@/constants/defaults";
import { analyzeNetwork } from "@/utils/networkAnalysis";

interface NetworkData {
  attestation: {
    path: string;
    uid: string;
    signature: {
      v: number;
      r: string;
      s: string;
    };
    data: string;
    timestamp: number;
  };
  pkid: string;
  date: string;
  profiles: Array<{
    source: string;
    profileID: string;
    userPKID: string;
    primaryWalletAddress: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    channels: Array<{
      type: string;
      visibility: string;
      isVerified: boolean;
      value: string;
    }>;
    credentials: Array<any>;
    ordinalities: {
      aggregate: number;
    };
    counts: {
      icebreakerConnections: number;
      icebreakerMutuals: number;
      farcasterFollowers: number;
      farcasterMutuals: number;
    };
    connectionDate: string;
  }>;
}

const Jobs = () => {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [jobDescription, setJobDescription] = useState(DEFAULT_JOB_DESCRIPTION);
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const { toast } = useToast();

  const handleFileUpload = (data: NetworkData) => {
    setNetworkData(data);
    toast({
      title: "Network data loaded",
      description: `Successfully loaded ${data.profiles.length} profiles`,
    });
  };

  const analyzeNetworkData = async () => {
    if (!networkData || !jobDescription || !apiKey) {
      toast({
        title: "Missing information",
        description: "Please provide all required information before analyzing",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const filteredProfiles = networkData.profiles.map((profile) => ({
        displayName: profile.displayName,
        bio: profile.bio,
        channels: profile.channels
          .filter((channel) => channel.visibility === "public")
          .map(({ type, value }) => ({ type, value })),
        connectionDate: profile.connectionDate,
      }));

      const matchesPromise = fetch(
        "https://api.openai.com/v1/chat/completions",
        {
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
                content:
                  "You are a professional recruiter analyzing network connections.",
              },
              {
                role: "user",
                content: `Given this job description: ${jobDescription}\n\nAnd these network profiles: ${JSON.stringify(
                  filteredProfiles
                )}\n\nReturn the top 20 people who are the best potential fits for this role, with a half line explanation why. Respond with nothing else but a json array of { name: string; explanation: string} with no formatting or line breaks.`,
              },
            ],
            stream: false,
          }),
        }
      );

      const referralsPromise = fetch(
        "https://api.openai.com/v1/chat/completions",
        {
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
                content:
                  "You are a professional recruiter analyzing network connections.",
              },
              {
                role: "user",
                content: `Given this job description: ${jobDescription}\n\nAnd these network profiles: ${JSON.stringify(
                  filteredProfiles
                )}\n\nReturn the top 20 people who might make the best referrals for this role, with a half line explanation why. Respond with nothing else but a json array of { name: string; explanation: string} with no formatting or line breaks.`,
              },
            ],
            stream: false,
          }),
        }
      );

      const [matchesResponse, referralsResponse] = await Promise.all([
        matchesPromise,
        referralsPromise,
      ]);

      const matchesData = await matchesResponse.json();
      const referralsData = await referralsResponse.json();

      setMatches(JSON.parse(matchesData.choices[0].message.content));
      setReferrals(JSON.parse(referralsData.choices[0].message.content));

      toast({
        title: "Analysis complete",
        description: "Successfully analyzed your network",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          "Failed to analyze network. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Network Job Match Analysis
        </h1>
        <p className="text-muted-foreground">
          Upload your network data and job description to find the best matches
          and potential referrals.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-xl font-semibold">Input Data</h2>
            <FileUpload onFileUpload={handleFileUpload} />

            <div className="space-y-2">
              <label className="text-sm font-medium">OpenAI API Key</label>
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Job Description</label>
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="h-32"
              />
            </div>

            <Button
              onClick={analyzeNetworkData}
              disabled={isLoading || !networkData || !jobDescription || !apiKey}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Analyzing...
                </>
              ) : (
                "Analyze Network"
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <ResultsList
            title="Best Matches"
            results={matches}
            isLoading={isLoading}
          />
          <ResultsList
            title="Best Referrals"
            results={referrals}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Jobs;
