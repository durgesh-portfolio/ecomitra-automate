// Quiz Answer Learning System
// This system works alongside the main NSPC automation to learn correct quiz answers

class QuizLearningSystem {
    constructor(apiBaseUrl = 'http://localhost:8000/api') {
        this.apiBaseUrl = apiBaseUrl;
        this.currentQuestion = null;
        this.currentOptions = [];
        this.answerAttempts = new Map(); // Track answer attempts and results
    }

    // Initialize monitoring of quiz interface
    startMonitoring() {
        this.observeQuizChanges();
        console.log('🔍 Quiz learning system activated');
    }

    // Set up mutation observer to detect quiz changes
    observeQuizChanges() {
        const observer = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                if (mutation.addedNodes.length) {
                    this.checkForQuizContent();
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Check if current content contains a quiz question
    async checkForQuizContent() {
        // Look for question text (adjust selectors based on actual quiz interface)
        const questionElement = document.querySelector('.question-text, .quiz-question');
        if (!questionElement) return;

        const questionText = questionElement.textContent.trim();
        if (questionText === this.currentQuestion) return; // Skip if same question

        // Get answer options
        const options = Array.from(document.querySelectorAll('.answer-option, .quiz-option'))
            .map(option => ({
                number: option.dataset.optionNumber || this.getOptionNumber(option),
                text: option.textContent.trim()
            }));

        if (options.length === 0) return;

        // Store current question context
        this.currentQuestion = questionText;
        this.currentOptions = options;

        // Check if we already know the answer
        const knownAnswer = await this.getKnownAnswer(questionText);
        if (knownAnswer) {
            console.log(`💡 Known answer for question: Option ${knownAnswer.correct_option_number}`);
            // You can use this information to automatically select the correct answer
            // if desired
        }
    }

    // Get option number from element (customize based on quiz interface)
    getOptionNumber(optionElement) {
        // Try to find option number from various possible sources
        const number = optionElement.dataset.number || 
                      optionElement.querySelector('.option-number')?.textContent ||
                      Array.from(optionElement.closest('.options-container').children)
                            .indexOf(optionElement) + 1;
        return number;
    }

    // Record correct answer when detected
    async recordCorrectAnswer(optionNumber) {
        if (!this.currentQuestion || !this.currentOptions) return;

        const correctOption = this.currentOptions.find(opt => opt.number == optionNumber);
        if (!correctOption) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/quiz-question/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    question: this.currentQuestion,
                    language: document.documentElement.lang || 'English', // or get from quiz interface
                    correct_option_text: correctOption.text,
                    correct_option_number: optionNumber
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Recorded correct answer for question (confidence: ${data.confidence_score})`);
            }
        } catch (error) {
            console.error('Failed to record correct answer:', error);
        }
    }

    // Get known answer for a question
    async getKnownAnswer(questionText) {
        try {
            const response = await fetch(
                `${this.apiBaseUrl}/quiz-question/?` + new URLSearchParams({
                    question: questionText,
                    language: document.documentElement.lang || 'English'
                }),
                {
                    headers: {
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                }
            );

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to get known answer:', error);
        }
        return null;
    }

    // Helper method to detect correct answers from quiz feedback
    detectCorrectAnswer() {
        // Look for success indicators (customize based on quiz interface)
        const successElement = document.querySelector('.correct-answer, .success-message');
        if (!successElement) return null;

        // Find selected option when success is shown
        const selectedOption = document.querySelector('.selected.answer-option, .quiz-option.selected');
        if (!selectedOption) return null;

        return this.getOptionNumber(selectedOption);
    }

    // Start automatic answer learning
    startAutoLearning() {
        // Monitor for correct answer indicators
        const observer = new MutationObserver(() => {
            const correctOption = this.detectCorrectAnswer();
            if (correctOption) {
                this.recordCorrectAnswer(correctOption);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        console.log('🤖 Auto-learning system activated');
    }
}

// Initialize and export the quiz learning system
window.quizLearningSystem = new QuizLearningSystem();

// Auto-start the learning system
window.quizLearningSystem.startMonitoring();
window.quizLearningSystem.startAutoLearning();

console.log(`
🎯 QUIZ ANSWER LEARNING SYSTEM LOADED!
=====================================

This system runs alongside the main NSPC automation to:
1. Monitor quiz questions and answers
2. Record correct answers when detected
3. Build a knowledge base of quiz answers
4. Help select correct answers for known questions

The system is already running and will:
✅ Automatically detect quiz questions
✅ Monitor for correct answer feedback
✅ Store answers in the database
✅ Increase confidence scores for repeatedly seen correct answers

You can access the system via: window.quizLearningSystem

Example usage:
- Check known answer: await window.quizLearningSystem.getKnownAnswer("question text")
- Record answer: await window.quizLearningSystem.recordCorrectAnswer(optionNumber)

The system works independently and won't interfere with the main automation.
`);
