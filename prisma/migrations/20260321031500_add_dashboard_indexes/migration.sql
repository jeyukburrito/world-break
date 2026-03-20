CREATE INDEX "match_results_userId_eventCategory_playedAt_idx"
ON "match_results"("userId", "eventCategory", "playedAt");

CREATE INDEX "match_results_userId_myDeckId_playedAt_idx"
ON "match_results"("userId", "myDeckId", "playedAt");
