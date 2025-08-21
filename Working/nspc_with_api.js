// NSPC Registration Automation with API Integration
async function automateNSPCRegistration() {
    const API_BASE_URL = 'http://localhost:8000/api';
    
    async function getNextEmployee() {
        const response = await fetch(`${API_BASE_URL}/next-employee/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to get next employee: ${response.statusText}`);
        }
        return await response.json();
    }
    
    async function markEmployeeCompleted(employeeId) {
        const response = await fetch(`${API_BASE_URL}/mark-completed/${employeeId}/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to mark employee as completed: ${response.statusText}`);
        }
        return await response.json();
    }
    
    async function getStatus() {
        const response = await fetch(`${API_BASE_URL}/status/`);
        if (!response.ok) {
            throw new Error(`Failed to get status: ${response.statusText}`);
        }
        return await response.json();
    }
    
    async function processNextEmployee() {
        try {
            // Get next employee from API
            const employee = await getNextEmployee();
            console.log('Processing employee:', employee.fullName);
            
            // Run the automation for this employee
            const success = await window.runNSPCAutomation(employee);
            
            if (success) {
                // Mark the employee as completed in the database
                await markEmployeeCompleted(employee.id);
                console.log(`Successfully completed registration for ${employee.fullName}`);
                
                // Get and display current status
                const status = await getStatus();
                console.log('Current status:', status);
                
                // Continue with next employee after a delay
                setTimeout(processNextEmployee, 3000);
            } else {
                console.error(`Failed to process employee ${employee.fullName}`);
                // You might want to implement retry logic here
            }
        } catch (error) {
            if (error.message.includes('No uncompleted employees found')) {
                console.log('✅ All employees have been processed!');
                const finalStatus = await getStatus();
                console.log('Final status:', finalStatus);
            } else {
                console.error('Error processing employee:', error);
            }
        }
    }
    
    // Start processing employees
    console.log('Starting NSPC automation with API integration...');
    processNextEmployee();
}

// Add to window object for easy console access
window.startNSPCAutomation = automateNSPCRegistration;

console.log(`
🌱 NSPC AUTOMATION WITH API INTEGRATION LOADED!
=============================================

To start the automation:
1. Make sure the Django server is running (python manage.py runserver)
2. Open the NSPC registration page in your browser
3. Open browser console (F12)
4. Run: startNSPCAutomation()

The script will:
✅ Get employees one by one from the API
✅ Automatically fill and submit registration forms
✅ Complete quizzes
✅ Mark completed employees in the database
✅ Show progress status
✅ Continue until all employees are processed

Monitor the console for progress and any errors.
`);
