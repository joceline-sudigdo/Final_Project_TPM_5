const API_URL = 'http://localhost:3000';

let teamMembers = { member1: null, member2: null, member3: null };
let teamData = null;
let teamToken = null;

// Initialize dashboard
async function initDashboard() {
    teamToken = localStorage.getItem('teamToken');
    
    if (!teamToken) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }
    
    await loadTeamData();
}

// Fetch team data from backend
async function loadTeamData() {
    try {
        const response = await fetch(`${API_URL}/api/dashboard`, {
            headers: {
                'Authorization': `Bearer ${teamToken}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('teamToken');
                alert('Session expired. Please login again.');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Failed to load team data');
        }
        
        teamData = await response.json();
        
        // Update UI with team data
        updateDashboardUI();
        
    } catch (error) {
        console.error('Error loading team data:', error);
        alert('Failed to load dashboard data');
    }
}

// Update dashboard UI with fetched data
function updateDashboardUI() {
    if (!teamData) return;
    
    // Update team name
    const welcomeText = document.querySelector('.welcome-text span');
    if (welcomeText) {
        welcomeText.textContent = teamData.team_name;
    }
    
    // Update leader profile
    const leader = teamData.team_leaders.find(m => m.role === 'leader');
    if (leader) {
        updateLeaderProfile(leader);
    }
    
    // Update members list
    const members = teamData.team_leaders.filter(m => m.role !== 'leader');
    members.forEach((member, index) => {
        const memberSlot = `member${index + 1}`;
        teamMembers[memberSlot] = {
            id: member.id,
            name: member.full_name
        };
        updateMemberUI(memberSlot, member.full_name);
    });
    
    // Update Add Member button state
    updateAddMemberButton();
}

// Update leader profile section
function updateLeaderProfile(leader) {
    const cardContent = document.querySelector('.deep-blue-card .card-content');
    if (cardContent) {
        const birthDate = new Date(leader.birth_date);
        const formattedDate = birthDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        cardContent.innerHTML = `
            Full Name :</strong> ${leader.full_name}</p>
            Email :</strong> ${leader.email}</p>
            Whatsapp Number :</strong> ${leader.whatsapp_number}</p>
            LINE ID :</strong> ${leader.line_id || '-'}</p>
            Github ID :</strong> ${leader.github_id || '-'}</p>
            Birth Place :</strong> ${leader.birth_place}</p>
            Birth Date :</strong> ${formattedDate}</p>
        `;
    }
}

// Update add member button state
function updateAddMemberButton() {
    const memberCount = Object.values(teamMembers).filter(m => m !== null).length;
    const btn = document.getElementById('btnAddMember');
    
    if (memberCount >= 3) {
        btn.innerText = 'Team Full';
        btn.style.opacity = '0.5';
        btn.disabled = true;
    } else {
        btn.innerText = '+ Add Member';
        btn.style.opacity = '1';
        btn.disabled = false;
    }
}

function openLogoutModal() {
    document.getElementById('logoutModal').style.display = 'flex';
}

function closeLogoutModal() {
    document.getElementById('logoutModal').style.display = 'none';
}

function confirmLogout() {
    localStorage.removeItem('teamToken');
    localStorage.removeItem('team_name');
    alert('Berhasil Logout!');
    window.location.href = '../user-dashboard/LoginPage/login.html';
}

function openAddMemberModal() {
    let slotToFill = '';
    let roleToAdd = '';
    
    if (!teamMembers.member1) {
        slotToFill = 'Member 1';
        roleToAdd = 'member1';
    } else if (!teamMembers.member2) {
        slotToFill = 'Member 2';
        roleToAdd = 'member2';
    } else if (!teamMembers.member3) {
        slotToFill = 'Member 3';
        roleToAdd = 'member3';
    } else {
        alert('Team Full!');
        return;
    }
    
    document.getElementById('modalMemberTitle').innerText = slotToFill;
    document.getElementById('addMemberForm').setAttribute('data-role', roleToAdd);
    document.getElementById('addMemberModal').style.display = 'block';
    document.querySelectorAll('.error-text').forEach(el => el.style.display = 'none');
}

function closeAddMemberModal() {
    document.getElementById('addMemberModal').style.display = 'none';
    document.getElementById('addMemberForm').reset();
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    let isValid = true;
    document.querySelectorAll('.error-text').forEach(el => el.style.display = 'none');
    
    const name = document.getElementById('inputName').value.trim();
    if (!name) {
        document.getElementById('errName').style.display = 'block';
        isValid = false;
    }
    
    const email = document.getElementById('inputEmail').value.trim();
    if (!email || !email.includes('@')) {
        document.getElementById('errEmail').style.display = 'block';
        isValid = false;
    }
    
    const wa = document.getElementById('inputWA').value.trim();
    if (!wa || wa.length < 9) {
        document.getElementById('errWA').style.display = 'block';
        isValid = false;
    }
    
    const lineId = document.getElementById('inputLine').value.trim();
    if (!lineId) {
        document.getElementById('errLine').style.display = 'block';
        isValid = false;
    }
    
    const githubId = document.getElementById('inputGithub').value.trim();
    if (!githubId) {
        document.getElementById('errGithub').style.display = 'block';
        isValid = false;
    }
    
    const birthPlace = document.getElementById('inputBirthPlace').value.trim();
    if (!birthPlace) {
        document.getElementById('errBirthPlace').style.display = 'block';
        isValid = false;
    }
    
    const birthDate = document.getElementById('inputBirthDate').value;
    if (!birthDate) {
        document.getElementById('errBirthDate').style.display = 'block';
        isValid = false;
    } else {
        // Check age >= 17
        const today = new Date();
        const birth = new Date(birthDate);
        const age = today.getFullYear() - birth.getFullYear();
        if (age < 17) {
            document.getElementById('errBirthDate').style.display = 'block';
            isValid = false;
        }
    }
    
    const cv = document.getElementById('inputCV').value;
    if (!cv) {
        document.getElementById('errCV').style.display = 'block';
        isValid = false;
    }
    
    const idCard = document.getElementById('inputIDCard').value;
    if (!idCard) {
        document.getElementById('errIDCard').style.display = 'block';
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Get role from form data attribute
    const role = document.getElementById('addMemberForm').getAttribute('data-role');
    
    // Submit to backend
    try {
        const response = await fetch(`${API_URL}/api/dashboard/member`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${teamToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: role,
                full_name: name,
                email: email,
                whatsapp_number: wa,
                line_id: lineId,
                github_id: githubId,
                birth_place: birthPlace,
                birth_date: birthDate
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add member');
        }
        
        const result = await response.json();
        
        // Update local state
        const memberSlot = role;
        teamMembers[memberSlot] = {
            id: result.member.id,
            name: name
        };
        
        // Update UI
        updateMemberUI(memberSlot, name);
        updateAddMemberButton();
        
        closeAddMemberModal();
        alert('Member added successfully!');
        
    } catch (error) {
        console.error('Error adding member:', error);
        alert(`Failed to add member: ${error.message}`);
    }
}

function simulateUpload(inputId) {
    document.getElementById(inputId).value = 'file_uploaded.pdf';
}

function updateMemberUI(elementId, name) {
    const span = document.querySelector(`#${elementId} .username-text`);
    if (span) {
        span.innerText = name;
        span.style.color = '#fff';
        span.style.fontWeight = 'bold';
    }
}

window.onclick = function(event) {
    if (event.target == document.getElementById('logoutModal')) closeLogoutModal();
    if (event.target == document.getElementById('addMemberModal')) closeAddMemberModal();
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initDashboard);