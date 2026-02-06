const API_URL = 'http://localhost:3000';

const RegistrationData = {
    save: function(key, value) {
        localStorage.setItem(`hackathon_${key}`, JSON.stringify(value));
    },
    
    get: function(key) {
        const data = localStorage.getItem(`hackathon_${key}`);
        return data ? JSON.parse(data) : null;
    },
    
    clear: function() {
        const keys = ['teamInfo', 'leader', 'member1', 'member2', 'member3'];
        keys.forEach(key => localStorage.removeItem(`hackathon_${key}`));
    }
};

function saveTeamInfo() {
    const teamName = document.getElementById('team_name').value.trim();
    const password = document.getElementById('pass').value;
    const isBinusian = document.getElementById('binusian').checked;
    
    RegistrationData.save('teamInfo', {
        team_name: teamName,
        password: password,
        is_binusian: isBinusian
    });
}

function saveLeaderInfo() {
    const leaderData = {
        role: 'leader',
        full_name: document.getElementById('full_name').value.trim(),
        email: document.getElementById('email').value.trim(),
        whatsapp_number: document.getElementById('wa').value.trim(),
        line_id: document.getElementById('line').value.trim(),
        github_id: document.getElementById('github').value.trim(),
        birth_place: document.getElementById('birth_place').value.trim(),
        birth_date: document.getElementById('birth_date').value,
        cv: document.getElementById('cv').files[0]?.name || null,
        id_card: document.getElementById('id').files[0]?.name || null
    };
    
    RegistrationData.save('leader', leaderData);
}

function saveMember1Info() {
    const member1Data = {
        role: 'member1',
        full_name: document.getElementById('full_name').value.trim(),
        email: document.getElementById('email').value.trim(),
        whatsapp_number: document.getElementById('wa').value.trim(),
        line_id: document.getElementById('line').value.trim(),
        github_id: document.getElementById('github').value.trim(),
        birth_place: document.getElementById('birth_place').value.trim(),
        birth_date: document.getElementById('birth_date').value,
        cv: document.getElementById('cv').files[0]?.name || null,
        id_card: document.getElementById('id').files[0]?.name || null
    };
    
    RegistrationData.save('member1', member1Data);
}

function saveMember2Info() {
    const member2Data = {
        role: 'member2',
        full_name: document.getElementById('full_name').value.trim(),
        email: document.getElementById('email').value.trim(),
        whatsapp_number: document.getElementById('wa').value.trim(),
        line_id: document.getElementById('line').value.trim(),
        github_id: document.getElementById('github').value.trim(),
        birth_place: document.getElementById('birth_place').value.trim(),
        birth_date: document.getElementById('birth_date').value,
        cv: document.getElementById('cv').files[0]?.name || null,
        id_card: document.getElementById('id').files[0]?.name || null
    };
    
    RegistrationData.save('member2', member2Data);
}

function saveMember3Info() {
    const member3Data = {
        role: 'member3',
        full_name: document.getElementById('full_name').value.trim(),
        email: document.getElementById('email').value.trim(),
        whatsapp_number: document.getElementById('wa').value.trim(),
        line_id: document.getElementById('line').value.trim(),
        github_id: document.getElementById('github').value.trim(),
        birth_place: document.getElementById('birth_place').value.trim(),
        birth_date: document.getElementById('birth_date').value,
        cv: document.getElementById('cv').files[0]?.name || null,
        id_card: document.getElementById('id').files[0]?.name || null
    };
    
    RegistrationData.save('member3', member3Data);
}

async function submitRegistration() {
    try {
        const teamInfo = RegistrationData.get('teamInfo');
        const leader = RegistrationData.get('leader');
        const member1 = RegistrationData.get('member1');
        const member2 = RegistrationData.get('member2');
        const member3 = RegistrationData.get('member3');
        
        if (!teamInfo || !leader) {
            alert('Registration data incomplete. Please start over.');
            window.location.href = 'Register.html';
            return false;
        }
        
        const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                team_name: teamInfo.team_name,
                password: teamInfo.password,
                is_binusian: teamInfo.is_binusian
            })
        });
        
        if (!registerResponse.ok) {
            const error = await registerResponse.json();
            throw new Error(error.error || 'Registration failed');
        }
        
        const registerData = await registerResponse.json();
        console.log('Team registered:', registerData);
        
        const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                team_name: teamInfo.team_name,
                password: teamInfo.password
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error('Auto-login failed');
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        
        localStorage.setItem('teamToken', token);
        localStorage.setItem('team_name', teamInfo.team_name);
        
        await submitMember(leader, token);
        
        if (member1 && member1.full_name) {
            await submitMember(member1, token);
        }
        if (member2 && member2.full_name) {
            await submitMember(member2, token);
        }
        if (member3 && member3.full_name) {
            await submitMember(member3, token);
        }
        
        RegistrationData.clear();
        
        window.location.href = 'Success.html';
        return true;
        
    } catch (error) {
        console.error('Registration error:', error);
        alert(`Registration failed: ${error.message}`);
        return false;
    }
}

async function submitMember(memberData, token) {
    const response = await fetch(`${API_URL}/api/dashboard/member`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            role: memberData.role,
            full_name: memberData.full_name,
            email: memberData.email,
            whatsapp_number: memberData.whatsapp_number,
            line_id: memberData.line_id,
            github_id: memberData.github_id,
            birth_place: memberData.birth_place,
            birth_date: memberData.birth_date
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to submit ${memberData.role}: ${error.error}`);
    }
    
    return await response.json();
}