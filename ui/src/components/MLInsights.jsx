import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, BarChart3, Users, Target } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

const MLInsights = ({ claims, ticker, quarter }) => {
  const [mlAnalysis, setMlAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (claims && claims.length > 0) {
      performMLAnalysis();
    }
  }, [claims]);

  const performMLAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get enhanced claims with ML analysis
      const enhancedResponse = await apiClient.enhanceClaims(claims);
      
      if (enhancedResponse.success) {
        // Detect anomalies
        const anomalyResponse = await apiClient.detectAnomalies(enhancedResponse.enhanced_claims);
        
        // Get executive sentiment analysis
        const sentimentResponse = await apiClient.getExecutiveSentiment(enhancedResponse.enhanced_claims);
        
        // Get sentiment-verification correlation
        const correlationResponse = await apiClient.getSentimentVerificationCorrelation(enhancedResponse.enhanced_claims);
        
        setMlAnalysis({
          enhancedClaims: enhancedResponse.enhanced_claims,
          anomalies: anomalyResponse.success ? anomalyResponse.anomaly_detection : null,
          executiveSentiment: sentimentResponse.success ? sentimentResponse.executive_sentiment : null,
          correlation: correlationResponse.success ? correlationResponse.correlation_analysis : null
        });
      }
    } catch (err) {
      setError('ML analysis failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
          <h3 className="text-lg font-semibold">ML Analysis</h3>
        </div>
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Analyzing claims with ML...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold">ML Analysis</h3>
        </div>
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!mlAnalysis) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">ML Analysis</h3>
        </div>
        <div className="mt-4 text-center text-gray-600">
          <p>No claims available for ML analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ML Analysis Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold">ML-Powered Insights</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {mlAnalysis.enhancedClaims.length} Claims Analyzed
            </span>
          </div>
        </div>
      </div>

      {/* Anomaly Detection */}
      {mlAnalysis.anomalies && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h4 className="text-lg font-semibold">Anomaly Detection</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Anomaly Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {(mlAnalysis.anomalies.anomaly_rate * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Anomalous Claims</p>
              <p className="text-2xl font-bold text-gray-900">
                {mlAnalysis.anomalies.anomaly_count}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Model Confidence</p>
              <p className="text-2xl font-bold text-gray-900">
                {(mlAnalysis.anomalies.model_confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {mlAnalysis.anomalies.anomalies.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Flagged Claims:</h5>
              {mlAnalysis.anomalies.anomalies.map((anomaly, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      Claim #{anomaly.claim_index + 1}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity} severity
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Reasons:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      {anomaly.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Executive Sentiment Analysis */}
      {mlAnalysis.executiveSentiment && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-5 w-5 text-purple-600" />
            <h4 className="text-lg font-semibold">Executive Sentiment Analysis</h4>
          </div>
          
          <div className="space-y-4">
            {Object.entries(mlAnalysis.executiveSentiment).map(([executive, data], index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">{executive}</h5>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(
                    data.avg_sentiment > 0.05 ? 'positive' : data.avg_sentiment < -0.05 ? 'negative' : 'neutral'
                  )}`}>
                    {data.avg_sentiment > 0.05 ? 'Positive' : data.avg_sentiment < -0.05 ? 'Negative' : 'Neutral'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Claims</p>
                    <p className="font-semibold">{data.claims_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Sentiment</p>
                    <p className="font-semibold">{data.avg_sentiment.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Confidence</p>
                    <p className="font-semibold">{(data.avg_confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Positive</p>
                    <p className="font-semibold text-green-600">{data.positive_claims}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sentiment-Verification Correlation */}
      {mlAnalysis.correlation && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h4 className="text-lg font-semibold">Sentiment vs. Accuracy Correlation</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Accurate Claims</h5>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-900 mb-1">
                  {mlAnalysis.correlation.accurate_claims_avg_sentiment.toFixed(3)}
                </p>
                <p className="text-sm text-green-700">
                  Average sentiment score ({mlAnalysis.correlation.accurate_count} claims)
                </p>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Discrepant Claims</h5>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-red-900 mb-1">
                  {mlAnalysis.correlation.discrepant_claims_avg_sentiment.toFixed(3)}
                </p>
                <p className="text-sm text-red-700">
                  Average sentiment score ({mlAnalysis.correlation.discrepant_count} claims)
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              {mlAnalysis.correlation.interpretation}
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Claims Sample */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-semibold">ML-Enhanced Claims Sample</h4>
        </div>
        
        <div className="space-y-4">
          {mlAnalysis.enhancedClaims.slice(0, 3).map((claim, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{claim.metric}</span>
                <div className="flex items-center space-x-2">
                  {claim.anomaly && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(claim.anomaly.severity)}`}>
                      Anomaly
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                    claim.ml_analysis?.sentiment?.sentiment || 'neutral'
                  )}`}>
                    {claim.ml_analysis?.sentiment?.sentiment || 'neutral'}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">"{claim.text}"</p>
              
              {claim.ml_analysis && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-1 font-medium">
                      {claim.ml_analysis.classification?.primary_category || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Importance:</span>
                    <span className="ml-1 font-medium">
                      {(claim.ml_analysis.classification?.importance_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Confidence:</span>
                    <span className="ml-1 font-medium">
                      {(claim.ml_analysis.sentiment?.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-1 font-medium capitalize">{claim.status}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MLInsights;
