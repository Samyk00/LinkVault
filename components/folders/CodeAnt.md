I have done the detailed analysis of the entire codebase using CodeAnt. 

Here's the complete analysis and the issues it found. 

I want you to go check each and everything mention the the excel file and the list I shared with you. Check the issues, find the reason and fix them after fixing double check to verifiy. 

Create a Antcode.md file put this entire excel list and the list I shared with you in checkbox format. After completing, update the file with mark completed. 

Before you proceed, at the top, give me a quick summary of the analysis of the CodeAnt- Code Analyzer: analysis then you can proceed with create md file and update it and then ensure you mention the reason to in concise manner in md file. 


Dupliacate: 
(Major)


Branch: main
|
356 duplicated lines
Refresh resultsFilter Files
Duplicate BlocksSeverityLikelihoodLinesActions
2 Duplicate Blocks
Major
Seen in 2 Files134 lines

1 - 
FileWindow
components/layout/mobile-sidebar.tsx
Line Window: [132:198]
components/layout/sidebar.tsx
Line Window: [103:169]

2 - 

FileWindow
components/layout/sidebar.tsx
Line Window: [198:249]
components/layout/mobile-sidebar.tsx
Line Window: [224:275]

3 - 

FileWindow
components/layout/mobile-sidebar.tsx
Line Window: [301:341]
components/layout/sidebar.tsx
Line Window: [278:318]

4 - 

FileWindow
components/layout/mobile-sidebar.tsx
Line Window: [33:60]
components/layout/sidebar.tsx
Line Window: [30:57]

5 - 

FileWindow
components/layout/mobile-sidebar.tsx
Line Window: [5:31]
components/layout/sidebar.tsx
Line Window: [5:29]



Duplicate (Minor)

1 - components/layout/sidebar.tsx
Line Window: [253:277]
components/layout/mobile-sidebar.tsx
Line Window: [276:300]

2 - components/layout/sidebar.tsx
Line Window: [173:197]
components/layout/mobile-sidebar.tsx
Line Window: [199:223]

3 - components/layout/sidebar.tsx
Line Window: [320:339]
components/layout/mobile-sidebar.tsx
Line Window: [344:363]

4 - components/links/link-card.tsx
Line Window: [365:380]
components/links/link-card-list.tsx
Line Window: [355:370]


5 - components/layout/sidebar.tsx	Line Window: [89:99]
components/layout/mobile-sidebar.tsx	Line Window: [121:131]


6- components/layout/mobile-sidebar.tsx	Line Window: [110:120]
components/layout/sidebar.tsx	Line Window: [75:85]


7 - components/layout/sidebar.tsx	Line Window: [61:71]
components/layout/mobile-sidebar.tsx	Line Window: [99:109]



8 - components/modals/bulk-delete-modal.tsx	Line Window: [3:19]
components/modals/bulk-move-modal.tsx	Line Window: [3:26]
