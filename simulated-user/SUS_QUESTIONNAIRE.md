# System Usability Scale (SUS) - 10-Item Questionnaire

## Overview

This tool uses the **official, validated 10-item System Usability Scale (SUS) questionnaire** to measure website usability. The SUS is one of the most widely-used and respected usability metrics in the industry.

**Key Facts:**
- ✅ Validated in thousands of studies
- ✅ Works with websites, apps, software, hardware
- ✅ Scores 0-100 (higher is better)
- ✅ Industry average: 68
- ✅ Takes just 10 questions to evaluate

---

## The 10 Questions

The AI rates each question on a **1-5 point scale**:
- **1** = Strongly Disagree
- **2** = Disagree  
- **3** = Neutral
- **4** = Agree
- **5** = Strongly Agree

### Positive-Leaning Questions (Odd)

**Q1: "I think that I would like to use this website frequently."**
- Measures: Willingness to return
- Positive response: 4-5 (would use frequently)
- Low response: 1-2 (would rarely use)

**Q3: "I thought the website was easy to use."**
- Measures: Perceived ease of use
- Positive response: 4-5 (found it easy)
- Low response: 1-2 (found it difficult)

**Q5: "I found the various functions in the website were well integrated."**
- Measures: Integration and coherence
- Positive response: 4-5 (well integrated)
- Low response: 1-2 (poorly integrated)

**Q7: "I imagine that most people would learn to use this website very quickly."**
- Measures: Learnability
- Positive response: 4-5 (easy to learn)
- Low response: 1-2 (hard to learn)

**Q9: "I felt very confident using the website."**
- Measures: Confidence and usability
- Positive response: 4-5 (very confident)
- Low response: 1-2 (not confident)

### Negative-Leaning Questions (Even)

**Q2: "I found the website unnecessarily complex."**
- Measures: Complexity issues
- Positive response: 1-2 (not complex)
- Low response: 4-5 (very complex)
- *Note: Reversed in scoring*

**Q4: "I think that I would need the support of a technical person to be able to use this website."**
- Measures: Self-sufficiency
- Positive response: 1-2 (don't need support)
- Low response: 4-5 (would need support)
- *Note: Reversed in scoring*

**Q6: "I thought there was too much inconsistency in this website."**
- Measures: Consistency
- Positive response: 1-2 (consistent)
- Low response: 4-5 (too inconsistent)
- *Note: Reversed in scoring*

**Q8: "I found the website very awkward to use."**
- Measures: Usability
- Positive response: 1-2 (not awkward)
- Low response: 4-5 (very awkward)
- *Note: Reversed in scoring*

**Q10: "I needed to learn a lot of things before I could get going with this website."**
- Measures: Learning curve
- Positive response: 1-2 (minimal learning)
- Low response: 4-5 (lots to learn)
- *Note: Reversed in scoring*

---

## Scoring Formula

The SUS score is calculated using a specific formula that accounts for the reversed questions:

```
1. Odd-numbered questions (1,3,5,7,9): contribution = response - 1
2. Even-numbered questions (2,4,6,8,10): contribution = 5 - response
3. Sum all contributions
4. Multiply by 2.5 to scale to 0-100
```

**Example:**
```
Responses: 5,2,5,2,4,2,4,2,5,1
Contributions:
  Q1: 5-1 = 4
  Q2: 5-2 = 3
  Q3: 5-1 = 4
  Q4: 5-2 = 3
  Q5: 4-1 = 3
  Q6: 5-2 = 3
  Q7: 4-1 = 3
  Q8: 5-2 = 3
  Q9: 5-1 = 4
  Q10: 5-1 = 4
  
Sum: 4+3+4+3+3+3+3+3+4+4 = 34
Score: 34 × 2.5 = 85 (Excellent!)
```

---

## Interpreting SUS Scores

### Score Ranges

| Score | Grade | Adjective | Interpretation |
|-------|-------|-----------|-----------------|
| **85-100** | A | Excellent | World-class usability. Users will return frequently. |
| **68-84** | B | Good | Strong usability. Most users satisfied. |
| **50-67** | C | OK | Acceptable. Needs improvement. |
| **Below 50** | F | Poor | Significant issues. Redesign recommended. |

### Industry Context

- **Industry Average:** 68
- **Great websites:** 70-80
- **Exceptional websites:** 80+
- **Broken websites:** <50

### Comparative Benchmarks

```
Google: ~80 (excellent)
Amazon: ~75 (good)
Average SaaS: 65-70 (ok/good)
Your Website: ?
```

---

## What Each Score Means

### Score 85-100 (Excellent)
✅ **Status:** Exceptional usability  
✅ **User behavior:** Will use frequently, tell others  
✅ **Business impact:** High retention, conversion  
✅ **Action needed:** Maintain quality, minor tweaks  

**Indicators:**
- Q1 is 4-5 (would use frequently)
- Q3 is 4-5 (easy to use)
- Q7 is 4-5 (easy to learn)
- Q9 is 4-5 (felt confident)

---

### Score 68-84 (Good)
✅ **Status:** Strong usability  
✅ **User behavior:** Generally satisfied, may return  
✅ **Business impact:** Solid performance  
⚠️ **Action needed:** Address weak areas  

**Typical pattern:**
- Mostly 4-5 on positive questions
- Mostly 1-2 on negative questions
- One or two areas with room to improve

---

### Score 50-67 (OK)
⚠️ **Status:** Acceptable but needs work  
⚠️ **User behavior:** Frustrated, may not return  
❌ **Business impact:** Moderate churn  
🔧 **Action needed:** Identify and fix issues  

**Typical pattern:**
- Mixed responses (3-4 on many questions)
- Multiple problem areas
- Unclear where to focus first

---

### Score Below 50 (Poor)
❌ **Status:** Significant usability issues  
❌ **User behavior:** Frustrated, abandon site  
❌ **Business impact:** High churn, negative reviews  
🚨 **Action needed:** Major redesign  

**Typical pattern:**
- Q1 is 1-2 (wouldn't use again)
- Q3 is 1-2 (not easy to use)
- Q9 is 1-2 (not confident)

---

## Improving Your SUS Score

### From Poor (< 50) to OK (50-67)
Focus on these high-impact changes:
1. **Simplify navigation** – Q2, Q8 (complexity, awkwardness)
2. **Make it learnable** – Q7, Q4 (learning curve, need support)
3. **Fix inconsistencies** – Q6 (too much inconsistency)

### From OK (50-67) to Good (68-84)
Address remaining weak areas:
1. **Improve integration** – Q5 (functions well integrated)
2. **Increase confidence** – Q9 (confident using website)
3. **Enhance polish** – Q1, Q3 (willingness to use, ease of use)

### From Good (68-84) to Excellent (85-100)
Perfect the experience:
1. **Delight users** – Make interactions smooth and fast
2. **Build habits** – Make returning users even more successful
3. **Reduce friction** – Eliminate all remaining pain points

---

## How This Tool Uses SUS

### Process

1. **Interaction:** AI interacts with your website
2. **Observation:** AI observes the experience
3. **Evaluation:** AI rates all 10 questions (1-5)
4. **Calculation:** Score calculated using official formula
5. **Report:** Results shown with all 10 responses

### HTML Report Shows

- ✅ **SUS Score** – 0-100
- ✅ **Adjective** – poor/ok/good/excellent
- ✅ **All 10 Responses** – Individual question ratings
- ✅ **Analysis** – AI's reasoning for the score
- ✅ **Interpretation** – What the score means

### JSON Export Includes

```json
{
  "susEvaluation": {
    "score": 75,
    "adjective": "good",
    "questions": {
      "1": 4,
      "2": 2,
      "3": 4,
      "4": 2,
      "5": 4,
      "6": 2,
      "7": 4,
      "8": 2,
      "9": 4,
      "10": 2
    },
    "analysis": "Website showed good integration of functions...",
    "timestamp": "2024-01-15T10:30:45.000Z"
  }
}
```

---

## Tips for Getting Accurate SUS Scores

### Provide Clear Goals
```bash
# Good: Specific task
export USER_GOAL="Sign up for account"

# Less helpful: Vague
export USER_GOAL="Explore the website"
```

### Run Multiple Times
- **Single run:** May vary ±5 points
- **3 runs:** More reliable trend
- **5+ runs:** Confident baseline

### Complex Websites
- Increase `MAX_ITERATIONS` for thorough testing
- Multiple goals to test different flows
- Compare scores across different sections

### Comparing Versions
```bash
# Test version A
export TARGET_URL="https://v1.example.com"
npm run dev  # SUS: 65

# Test version B  
export TARGET_URL="https://v2.example.com"
npm run dev  # SUS: 72

# Version B is better! 🎉
```

---

## Academic Background

### SUS Research

The System Usability Scale was developed by **Jeff Sauro** at Measuring Usability LLC. It's been validated in:
- **1000s of studies** across different industries
- **Multiple languages** and cultural contexts
- **Hardware, software, websites, and apps**

### Why SUS is Used

1. **Reliability:** Consistent results across studies
2. **Validity:** Correlates with actual user satisfaction
3. **Brevity:** Just 10 questions (saves time)
4. **Universality:** Works for any interactive system
5. **Industry standard:** Benchmarks available for comparison

### Key References

- Brooke, J. (1996). "SUS - A quick and dirty usability scale"
- Bangor, A., Kortum, P., Miller, J. (2009). "Determining what individual SUS scores mean"
- Sauro, J. (2011). "Measuring usability with the System Usability Scale (SUS)"

---

## Common Questions

**Q: Why only 10 questions if there are 5 dimensions?**
A: Each question is carefully designed to independently measure usability. The 5 dimensions emerge from these 10 questions, but all 10 are needed for the validated scoring formula.

**Q: Can I modify the questions?**
A: If you do, it's no longer the standard SUS and results won't be comparable. The power of SUS is using the exact same 10 questions globally.

**Q: Why are some questions reversed?**
A: This reduces bias from people just picking "strongly agree" for everything. Reversed questions force thoughtful responses.

**Q: Is 68 really the magic number?**
A: Yes! In 1000s of studies, 68 is the average SUS score. It's a natural reference point. >68 is "above average."

**Q: Can a website score 0 or 100?**
A: Theoretically yes, but extremely rare. 0 would mean every question scored 1, 100 would mean perfect scores matching the formula.

---

## Resources

- **Official SUS Documentation:** measureusability.com/sus
- **SUS Score Interpretation:** usability.gov/guidelines/sus
- **Benchmarking Data:** measuringu.com/sus-benchmark
- **Tools & Calculators:** Various SUS calculators available online

---

**Last Updated:** 2024-01-15  
**Version:** 2.0.0 (Using Official 10-Item Questionnaire)  
**Status:** ✅ Validated & Industry-Standard
