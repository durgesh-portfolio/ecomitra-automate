// NSPC Quick Browser Console Automation
// Copy and paste this entire script into browser console (F12)

// Quick automation for NSPC registration and quiz
(async function() {
    console.log('🌱 NSPC Quick Automation Starting...');

    // Utility functions
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const log = (msg) => console.log(`[NSPC] ${new Date().toLocaleTimeString()} - ${msg}`);

    // Helper function to find button by text content (replaces invalid :contains() selector)
    const findButtonByText = (text, caseSensitive = false) => {
        const buttons = document.querySelectorAll('button, .v-btn, input[type="submit"], input[type="button"]');
        for (let button of buttons) {
            const buttonText = button.textContent || button.innerText || button.value || '';
            const searchText = caseSensitive ? buttonText : buttonText.toLowerCase();
            const targetText = caseSensitive ? text : text.toLowerCase();

            if (searchText.includes(targetText)) {
                return button;
            }
        }
        return null;
    };

    // Helper function to find multiple buttons by text content
    const findButtonsByText = (text, caseSensitive = false) => {
        const buttons = document.querySelectorAll('button, .v-btn, input[type="submit"], input[type="button"]');
        const matchingButtons = [];
        for (let button of buttons) {
            const buttonText = button.textContent || button.innerText || button.value || '';
            const searchText = caseSensitive ? buttonText : buttonText.toLowerCase();
            const targetText = caseSensitive ? text : text.toLowerCase();

            if (searchText.includes(targetText)) {
                matchingButtons.push(button);
            }
        }
        return matchingButtons;
    };

    // Debug function to list all available buttons
    const debugButtons = () => {
        log('🔍 Available buttons on page:');
        const allButtons = document.querySelectorAll('button, .v-btn, input[type="submit"], input[type="button"]');
        allButtons.forEach((btn, index) => {
            const text = btn.textContent || btn.innerText || btn.value || 'No text';
            const classes = btn.className || 'No classes';
            log(`   ${index + 1}. "${text}" (${btn.tagName}, classes: ${classes})`);
        });
        return allButtons;
    };

    // Helper function to find dropdown by label or nearby text
    const findDropdownByLabel = (labelText) => {
        // Try to find by label element
        const labels = document.querySelectorAll('label');
        for (let label of labels) {
            const text = label.textContent || label.innerText || '';
            if (text.toLowerCase().includes(labelText.toLowerCase())) {
                // Look for associated form control
                const forId = label.getAttribute('for');
                if (forId) {
                    return document.getElementById(forId);
                }
                // Look for dropdown in same container
                const container = label.closest('.form-group, .v-input, .field, div');
                if (container) {
                    const dropdown = container.querySelector('select, .v-select, .v-menu, [role="combobox"], [role="listbox"]');
                    if (dropdown) return dropdown;
                }
            }
        }

        // Try to find by placeholder or aria-label
        const dropdowns = document.querySelectorAll('select, .v-select, .v-menu, [role="combobox"], [role="listbox"]');
        for (let dropdown of dropdowns) {
            const placeholder = dropdown.getAttribute('placeholder') || '';
            const ariaLabel = dropdown.getAttribute('aria-label') || '';
            const title = dropdown.getAttribute('title') || '';

            if (placeholder.toLowerCase().includes(labelText.toLowerCase()) ||
                ariaLabel.toLowerCase().includes(labelText.toLowerCase()) ||
                title.toLowerCase().includes(labelText.toLowerCase())) {
                return dropdown;
            }
        }

        return null;
    };

    // Helper function to select dropdown option by text
    const selectDropdownOption = async (dropdown, optionText, caseSensitive = false) => {
        if (!dropdown) return false;

        try {
            // Handle standard HTML select
            if (dropdown.tagName === 'SELECT') {
                const options = dropdown.querySelectorAll('option');
                for (let option of options) {
                    const text = option.textContent || option.innerText || '';
                    const value = option.value || '';
                    const searchText = caseSensitive ? text : text.toLowerCase();
                    const searchValue = caseSensitive ? value : value.toLowerCase();
                    const targetText = caseSensitive ? optionText : optionText.toLowerCase();

                    if (searchText.includes(targetText) || searchValue.includes(targetText)) {
                        dropdown.value = option.value;
                        dropdown.dispatchEvent(new Event('change', { bubbles: true }));
                        dropdown.dispatchEvent(new Event('input', { bubbles: true }));
                        return true;
                    }
                }
            }

            // Handle Vue.js dropdowns (.v-select, .v-menu)
            if (dropdown.classList.contains('v-select') || dropdown.classList.contains('v-menu')) {
                // Click to open dropdown
                dropdown.click();
                await wait(500);

                // Look for dropdown items
                const items = document.querySelectorAll('.v-list-item, .v-menu__content .v-list-item, .menuable__content__active .v-list-item');
                for (let item of items) {
                    const text = item.textContent || item.innerText || '';
                    const searchText = caseSensitive ? text : text.toLowerCase();
                    const targetText = caseSensitive ? optionText : optionText.toLowerCase();

                    if (searchText.includes(targetText)) {
                        item.click();
                        await wait(200);
                        return true;
                    }
                }
            }

            // Handle custom dropdowns with role="combobox"
            if (dropdown.getAttribute('role') === 'combobox') {
                dropdown.click();
                await wait(500);

                // Look for dropdown options
                const listbox = document.querySelector('[role="listbox"]');
                if (listbox) {
                    const options = listbox.querySelectorAll('[role="option"]');
                    for (let option of options) {
                        const text = option.textContent || option.innerText || '';
                        const searchText = caseSensitive ? text : text.toLowerCase();
                        const targetText = caseSensitive ? optionText : optionText.toLowerCase();

                        if (searchText.includes(targetText)) {
                            option.click();
                            await wait(200);
                            return true;
                        }
                    }
                }
            }

            // Handle generic clickable dropdowns
            dropdown.click();
            await wait(500);

            // Look for any dropdown options that appeared
            const possibleOptions = document.querySelectorAll(
                '.dropdown-item, .menu-item, .option, .v-list-item, [data-value], li'
            );

            for (let option of possibleOptions) {
                const text = option.textContent || option.innerText || '';
                const searchText = caseSensitive ? text : text.toLowerCase();
                const targetText = caseSensitive ? optionText : optionText.toLowerCase();

                if (searchText.includes(targetText) && option.offsetParent !== null) { // visible element
                    option.click();
                    await wait(200);
                    return true;
                }
            }

        } catch (error) {
            log(`❌ Error selecting dropdown option: ${error.message}`);
        }

        return false;
    };

    // Debug function to list all available dropdowns
    const debugDropdowns = () => {
        log('🔍 Available dropdowns on page:');
        const dropdowns = document.querySelectorAll('select, .v-select, .v-menu, [role="combobox"], [role="listbox"]');
        dropdowns.forEach((dropdown, index) => {
            const tag = dropdown.tagName;
            const classes = dropdown.className || 'No classes';
            const id = dropdown.id || 'No ID';
            const placeholder = dropdown.getAttribute('placeholder') || 'No placeholder';
            const ariaLabel = dropdown.getAttribute('aria-label') || 'No aria-label';

            log(`   ${index + 1}. ${tag} (ID: ${id}, classes: ${classes})`);
            log(`      Placeholder: "${placeholder}", Aria-label: "${ariaLabel}"`);

            // Show options for select elements
            if (tag === 'SELECT') {
                const options = dropdown.querySelectorAll('option');
                options.forEach((option, optIndex) => {
                    const text = option.textContent || option.innerText || '';
                    const value = option.value || '';
                    log(`         Option ${optIndex + 1}: "${text}" (value: "${value}")`);
                });
            }
        });
        return dropdowns;
    };

    // Fill registration form with enhanced dropdown support
    async function fillRegistration(data) {
        log('Filling registration form...');

        try {
            // Fill Full Name (first text input)
            const nameInput = document.querySelector('input[type="text"]:not([disabled]):not([readonly])');
            if (nameInput) {
                const fullName = data.fullName || data.name;
                nameInput.value = fullName;
                nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                nameInput.dispatchEvent(new Event('change', { bubbles: true }));
                log(`✅ Name filled: ${fullName}`);
            } else {
                log('⚠️ Name input not found');
            }

            await wait(500);

            // Select Gender dropdown
            if (data.gender) {
                log(`🔄 Selecting gender: ${data.gender}`);
                const genderDropdown = findDropdownByLabel('Gender') ||
                                     document.querySelector('select[name*="gender"], .v-select[aria-label*="Gender"]');

                if (genderDropdown) {
                    const success = await selectDropdownOption(genderDropdown, data.gender);
                    if (success) {
                        log(`✅ Gender selected: ${data.gender}`);
                    } else {
                        log(`⚠️ Failed to select gender: ${data.gender}`);
                    }
                } else {
                    log('⚠️ Gender dropdown not found');
                }
            }

            await wait(500);

            // Fill Phone (second text input or specific phone input)
            const phoneInput = document.querySelector('input[type="tel"], input[name*="phone"], input[placeholder*="phone"]') ||
                              document.querySelectorAll('input[type="text"]:not([disabled]):not([readonly])')[1];
            if (phoneInput) {
                phoneInput.value = data.phone;
                phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
                phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
                log(`✅ Phone filled: ${data.phone}`);
            } else {
                log('⚠️ Phone input not found');
            }

            await wait(500);

            // Select Class/UG/PG dropdown
            if (data.classLevel) {
                log(`🔄 Selecting class level: ${data.classLevel}`);
                const classDropdown = findDropdownByLabel('Class') || findDropdownByLabel('UG') || findDropdownByLabel('PG') ||
                                     document.querySelector('select[name*="class"], .v-select[aria-label*="Class"]');

                if (classDropdown) {
                    const success = await selectDropdownOption(classDropdown, data.classLevel);
                    if (success) {
                        log(`✅ Class level selected: ${data.classLevel}`);
                    } else {
                        log(`⚠️ Failed to select class level: ${data.classLevel}`);
                    }
                } else {
                    log('⚠️ Class level dropdown not found');
                }
            }

            await wait(500);

            // Select Registration Type dropdown
            if (data.registrationType) {
                log(`🔄 Selecting registration type: ${data.registrationType}`);
                const regTypeDropdown = findDropdownByLabel('Registration') || findDropdownByLabel('type') ||
                                       document.querySelector('select[name*="registration"], .v-select[aria-label*="Registration"]');

                if (regTypeDropdown) {
                    const success = await selectDropdownOption(regTypeDropdown, data.registrationType);
                    if (success) {
                        log(`✅ Registration type selected: ${data.registrationType}`);
                    } else {
                        log(`⚠️ Failed to select registration type: ${data.registrationType}`);
                    }
                } else {
                    log('⚠️ Registration type dropdown not found');
                }
            }

            await wait(500);

            // Fill School/Organization
            const schoolInput = document.querySelector('input[name*="school"], input[name*="organization"], input[placeholder*="school"]') ||
                               document.querySelectorAll('input[type="text"]:not([disabled]):not([readonly])')[2];
            if (schoolInput) {
                schoolInput.value = data.school;
                schoolInput.dispatchEvent(new Event('input', { bubbles: true }));
                schoolInput.dispatchEvent(new Event('change', { bubbles: true }));
                log(`✅ School filled: ${data.school}`);
            } else {
                log('⚠️ School input not found');
            }

            await wait(500);

            // Select Language dropdown
            if (data.language) {
                log(`🔄 Selecting language: ${data.language}`);
                const languageDropdown = findDropdownByLabel('Language') || findDropdownByLabel('Quiz') ||
                                        document.querySelector('select[name*="language"], .v-select[aria-label*="Language"]');

                if (languageDropdown) {
                    const success = await selectDropdownOption(languageDropdown, data.language);
                    if (success) {
                        log(`✅ Language selected: ${data.language}`);
                    } else {
                        log(`⚠️ Failed to select language: ${data.language}`);
                    }
                } else {
                    log('⚠️ Language dropdown not found');
                }
            }

            await wait(500);

            // Fill Postal Code
            const postalInput = document.querySelector('input[type="number"], input[name*="postal"], input[placeholder*="postal"]');
            if (postalInput) {
                const postalCode = data.postalCode || data.postal;
                postalInput.value = postalCode;
                postalInput.dispatchEvent(new Event('input', { bubbles: true }));
                postalInput.dispatchEvent(new Event('change', { bubbles: true }));
                log(`✅ Postal code filled: ${postalCode}`);
            } else {
                log('⚠️ Postal code input not found');
            }

            await wait(1000);

            // Submit form
            const submitBtn = findButtonByText('Submit');
            if (submitBtn) {
                submitBtn.click();
                log('✅ Registration submitted!');
                return true;
            } else {
                log('❌ Submit button not found. Available buttons:');
                debugButtons();
                log('🔍 Available dropdowns:');
                debugDropdowns();
                throw new Error('Submit button not found');
            }

        } catch (error) {
            log(`❌ Registration error: ${error.message}`);
            log('🔍 Debug information:');
            debugButtons();
            debugDropdowns();
            return false;
        }
    }

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
    // Complete quiz
    async function completeQuiz() {
        await wait(800);
        log('Starting quiz automation...');

        try {
            for (let i = 1; i <= 20; i++) {
                log(`Answering question ${i}/20`);

                await wait(300);

                // Find and click first answer option
                const radioButtons = document.querySelectorAll('input[type="radio"], .v-radio input, .answer-option');
                if (radioButtons.length > 0) {
                    const randomIndex = getRandomInt(0, radioButtons.length - 1);
                    radioButtons[randomIndex].click();
                    log(`✅ Selected answer ${randomIndex + 1} for question ${i}`);
                }
                else {
                    log('⚠️ No radio buttons found for question ' + i);
                    i--;
                    continue; // Retry this question
                }
                await wait(200);

                // Click next button
                const nextBtn = findButtonByText('Next') || document.querySelector('.next-btn');
                if (nextBtn) {
                    nextBtn.click();
                } else {
                    log('⚠️ Next button not found - may be on last question');
                }

                await wait(200);
            }

            // Submit quiz
            const submitBtn = findButtonByText('Submit') || findButtonByText('Finish') || document.querySelector('.submit-quiz');
            if (submitBtn) {
                submitBtn.click();
                log('✅ Quiz submitted!');
            } else {
                log('⚠️ Quiz submit button not found - quiz may have auto-submitted');
            }

            return true;

        } catch (error) {
            log(`❌ Quiz error: ${error.message}`);
        }

        return false;
    }

    // Handle post-quiz and prepare for next student (Based on Guide.txt workflow)
    async function handlePostQuiz() {
        log('Handling post-quiz actions...');

        await wait(2000); // Wait longer for quiz results to load

        // Step 1: Click Yes button (appears after quiz completion)
        const yesBtn = findButtonByText('Yes') || document.querySelector('.yes-btn');
        if (yesBtn) {
            yesBtn.click();
            log('✅ Clicked Yes button');
            await wait(1500); // Wait for navigation
        } else {
            log('⚠️ Yes button not found - may not be required');
        }

        // Step 2: Click Back button to return to main page
        const backBtn = findButtonByText('Back') || findButtonByText('New') ||
                       document.querySelector('.back-btn, .v-app-bar__nav-icon');
        if (backBtn) {
            backBtn.click();
            log('✅ Clicked Back button');
            await wait(1500); // Wait for main page to load
        } else {
            log('⚠️ Back button not found - trying alternative navigation');
            // Try clicking the back arrow in header
            const headerBack = document.querySelector('.v-app-bar__nav-icon, .back-link');
            if (headerBack) {
                headerBack.click();
                log('✅ Clicked header back button');
                await wait(1200);
            }
        }

        // Step 3: Click "PARTICIPATE as NON-STUDENT" button to start new registration
        const participateBtn = findButtonByText('PARTICIPATE as NON-STUDENT') ||
                              findButtonByText('NON-STUDENT') ||
                              findButtonByText('PARTICIPATE');

        if (participateBtn) {
            participateBtn.click();
            log('✅ Clicked PARTICIPATE as NON-STUDENT button - Ready for next student');
            await wait(2000); // Wait for registration form to load
            return true;
        } else {
            log('❌ PARTICIPATE as NON-STUDENT button not found');
            log('🔍 Available buttons:');
            debugButtons();
            return false;
        }
    }

    // Sample student data - Compatible with enhanced student data structure
    const sampleStudent = {
        id: 1,
        fullName: "Test Student",
        name: "Test Student", // For backward compatibility
        phone: "9876543210",
        gender: "Male",
        classLevel: "Not a Student",
        registrationType: "Through School/College/Institution",
        school: "IIMT",
        language: "English",
        postalCode: "250001",
        postal: "250001" // For backward compatibility
    };

    // Main automation function - Compatible with enhanced student data
    window.runNSPCAutomation = async function(studentData = sampleStudent) {
        try {
            log('🚀 Starting NSPC automation...');
            log(`📋 Student: ${studentData.fullName || studentData.name}`);
            log(`📞 Phone: ${studentData.phone}`);
            log(`🏫 School: ${studentData.school}`);
            log(`🌍 Registration: ${studentData.registrationType}`);
            log(`📍 Postal Code: ${studentData.postalCode || studentData.postal}`);

            // Step 1: Registration
            const regSuccess = await fillRegistration(studentData);
            if (!regSuccess) {
                log('❌ Registration failed');
                return false;
            }

            await wait(3000); // Wait for quiz page

            // Step 2: Quiz
            const quizSuccess = await completeQuiz();
            if (!quizSuccess) {
                log('❌ Quiz failed');
                return false;
            }

            // Step 3: Post-quiz and prepare for next student
            const resetSuccess = await handlePostQuiz();
            if (!resetSuccess) {
                log('⚠️ Form reset may have failed - check manually');
            }

            log('🎉 Automation completed successfully!');
            return true;

        } catch (error) {
            log(`❌ Automation failed: ${error.message}`);
            console.error('Full error details:', error);

            // Debug information
            log('🔍 Debug: Listing available buttons...');
            debugButtons();
            log('🔍 Debug: Listing available dropdowns...');
            debugDropdowns();

            return false;
        }
    };

    // Sequential student processing function
    window.runMultipleStudents = async function(students, delayBetweenStudents = 3000) {
        if (!Array.isArray(students) || students.length === 0) {
            log('❌ Invalid students array provided');
            return false;
        }

        log(`🚀 Starting sequential processing of ${students.length} students...`);

        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            log(`\n📋 Processing student ${i + 1}/${students.length}: ${student.fullName || student.name}`);

            try {
                const success = await runNSPCAutomation(student);
                if (success) {
                    successCount++;
                    log(`✅ Student ${i + 1} completed successfully`);
                } else {
                    failureCount++;
                    log(`❌ Student ${i + 1} failed`);
                }
            } catch (error) {
                failureCount++;
                log(`❌ Student ${i + 1} failed with error: ${error.message}`);
            }

            // Wait between students (except for the last one)
            if (i < students.length - 1) {
                log(`⏳ Waiting ${delayBetweenStudents/1000} seconds before next student...`);
                await wait(delayBetweenStudents);
            }
        }

        log(`\n🎯 Sequential processing completed!`);
        log(`✅ Successful: ${successCount}/${students.length}`);
        log(`❌ Failed: ${failureCount}/${students.length}`);

        return { successCount, failureCount, total: students.length };
    };

    // Quick start instructions
    console.log(`
🌱 NSPC QUICK AUTOMATION LOADED! (Enhanced with CSS Selector Fixes)
==================================================================

🚀 QUICK START:
   runNSPCAutomation();

📝 CUSTOM STUDENT:
   runNSPCAutomation({
       fullName: "John Doe",
       name: "John Doe",
       phone: "9876543210",
       gender: "Male",
       classLevel: "Not a Student",
       registrationType: "Through School/College/Institution",
       school: "IIMT",
       language: "English",
       postalCode: "250001"
   });

🎯 ENHANCED STUDENT DATA COMPATIBLE:
   // Load student_data_100_enhanced.js first, then:
   runNSPCAutomation(FIRST_STUDENT);
   runNSPCAutomation(StudentDataUtils.getRandomStudent());

🔄 SEQUENTIAL STUDENT PROCESSING:
   // Process multiple students automatically:
   runMultipleStudents(StudentDataUtils.getRandomStudents(5));
   runMultipleStudents(StudentDataUtils.getVanarSenaStudents());
   runMultipleStudents(StudentDataUtils.getIIMTStudents());

🔧 FIXES APPLIED:
   ✅ Replaced invalid :contains() CSS selectors
   ✅ Added proper button text search functions
   ✅ Enhanced dropdown selection functionality
   ✅ Support for Vue.js, HTML select, and custom dropdowns
   ✅ Comprehensive form field detection and filling
   ✅ Fixed sequential student processing workflow
   ✅ Proper form reset between students
   ✅ Enhanced error handling and debugging
   ✅ Compatible with enhanced student data structure

⚠️ MAKE SURE:
   - You're on the NSPC registration page
   - Keep browser tab active
   - Watch console for progress

✅ Ready to automate!
    `);

})();