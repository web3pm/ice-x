import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUpload from '@/components/FileUpload';
import ResultsList from '@/components/ResultsList';
import { useToast } from "@/components/ui/use-toast";

interface NetworkData {
  profiles: Array<{
    displayName: string;
    bio: string;
    channels: Array<{
      type: string;
      value: string;
    }>;
  }>;
}

const Index = () => {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [apiKey, setApiKey] = useState('');
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

  const analyzeNetwork = async () => {
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
      const matchesPromise = fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a professional recruiter analyzing network connections.',
            },
            {
              role: 'user',
              content: `Given this job description: ${jobDescription}\n\nAnd these network profiles: ${JSON.stringify(networkData.profiles)}\n\nReturn the top 20 people who are the best potential fits for this role, with a 1 line explanation why.`,
            },
          ],
        }),
      });

      const referralsPromise = fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a professional recruiter analyzing network connections.',
            },
            {
              role: 'user',
              content: `Given this job description: ${jobDescription}\n\nAnd these network profiles: ${JSON.stringify(networkData.profiles)}\n\nReturn the top 20 people who might make the best referrals for this role, with a 1 line explanation why.`,
            },
          ],
        }),
      });

      const [matchesResponse, referralsResponse] = await Promise.all([
        matchesPromise,
        referralsPromise,
      ]);

      const matchesData = await matchesResponse.json();
      const referralsData = await referralsResponse.json();

      setMatches(matchesData.choices[0].message.content);
      setReferrals(referralsData.choices[0].message.content);

      toast({
        title: "Analysis complete",
        description: "Successfully analyzed your network",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze network. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Network Job Match Analysis</h1>
        <p className="text-muted-foreground">
          Upload your network data and job description to find the best matches and potential referrals.
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
              onClick={analyzeNetwork}
              disabled={isLoading || !networkData || !jobDescription || !apiKey}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Analyzing...
                </>
              ) : (
                'Analyze Network'
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

export default Index;