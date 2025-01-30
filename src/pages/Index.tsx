import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import ResultsList from "@/components/ResultsList";
import { useToast } from "@/components/ui/use-toast";
import { analyzeNetwork } from "@/utils/networkAnalysis";
import { Link } from "react-router-dom";
import { DEFAULT_PROMPT } from "@/constants/defaults";

const Index = () => {
  const [networkData, setNetworkData] = useState(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const { toast } = useToast();

  const handleFileUpload = (data) => {
    setNetworkData(data);
    toast({
      title: "Network data loaded",
      description: `Successfully loaded ${data.profiles.length} profiles`,
    });
  };

  const analyzeNetworkData = async () => {
    if (!networkData || !prompt || !apiKey) {
      toast({
        title: "Missing information",
        description: "Please provide all required information before analyzing",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const results = await analyzeNetwork(apiKey, networkData, prompt);
      setResults(results);
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
          Experimental AI Network Helper
        </h1>
        <p className="text-muted-foreground">
          Upload your network from Icebreaker and ask questions using AI.
        </p>
        <div className="flex gap-2">
          <Link
            to="/jobs"
            className="text-sm text-blue-500 hover:text-blue-600 underline"
          >
            Go to Job Matching
          </Link>
        </div>
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
              <label className="text-sm font-medium">Your Question</label>
              <Textarea
                placeholder="Ask a question about your network..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-32"
              />
            </div>

            <Button
              onClick={analyzeNetworkData}
              disabled={isLoading || !networkData || !prompt || !apiKey}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Thinking...
                </>
              ) : (
                "Analyze Network"
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <ResultsList
            title="Analysis Results"
            results={results}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
