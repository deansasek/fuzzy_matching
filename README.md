# fuzzy_matching
Attempt at fuzzy string matching without leveraging existing algorithms (Levenshtein, Jaro-Winkler).  
  
Character frequency, character positions, and character abbreviations are leveraged to determine the score of similarity.  
  
Example:  
"123 main st" vs "123 main street"  
Score: 100  
  
"John R Smith" vs "John Robert Smith"  
Score: 100  
  
"1/2/1997" vs "1/2/97"  
Score: 100  

JavaScript & Python both included with the same function layout.
