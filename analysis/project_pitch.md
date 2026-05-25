# Project Pitch

## Title

worldcup-manager-2026 - Fixed Knockout Stage Flow

## Pitch

worldcup-manager-2026 is a full-stack web application to manage one fixed World Cup style knockout competition. The platform uses four role levels to clearly demonstrate authorization and role-specific views: admin, coach, referee, and guest. Competition metadata (name, year, host country) is fixed from app configuration, and the app manages fixed stages (8th Final, Quarterfinal, Semifinal, Final) using match-level stage metadata instead of a separate Round entity. Coaches maintain player availability using fixed values: available or unavailable. A dedicated Player table with unique player ID is included so goals can be linked to exact players. Referees insert and update match status and goals, and register which player scored each goal for their assigned matches, while admin can update results for all matches. Referees can only select players with available status when registering goal scorers. This data is later used for top-scorer ranking. Guests can only view public competition information such as fixtures, bracket progress, and results. This keeps the project manageable for school while still showing strong role-based behavior and complete competition flow.
