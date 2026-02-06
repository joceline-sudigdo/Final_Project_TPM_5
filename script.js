const API_URL = 'http://localhost:3000';
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

let teams = [];
let participants = [];
let currentTab = 'participants';
let sortStates = { name: 'asc', date: 'asc', team: 'asc' };
let selectedParticipantId = null;
let selectedTeamId = null;
let adminToken = null;

function getAdminToken() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'login.html';
        return null;
    }
    return token;
}

async function fetchWithAuth(url, options = {}) {
    const token = getAdminToken();
    if (!token) return null;
    
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

async function fetchData() {
    try {
        const [teamsResponse, participantsResponse, statsResponse] = await Promise.all([
            fetchWithAuth(`${API_URL}/api/admin/teams`),
            fetchWithAuth(`${API_URL}/api/admin/participants`),
            fetchWithAuth(`${API_URL}/api/admin/stats`)
        ]);
        
        if (!teamsResponse || !teamsResponse.ok || !participantsResponse || !participantsResponse.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const teamsData = await teamsResponse.json();
        const participantsData = await participantsResponse.json();
        
        teams = teamsData.map(team => ({
            id: team.id,
            name: team.team_name,
            leader: team.leader ? team.leader.full_name : '-',
            email: team.leader ? team.leader.email : '-',
            phone: team.leader ? team.leader.whatsapp_number : '-',
            date: team.created_at,
            password: '••••••••',
            status: team.is_binusian ? 'BINUSIAN' : 'Non-BINUSIAN',
            hasIncompleteInfo: !team.leader || team.team_leaders.length === 0,
            participants: team.team_leaders.length,
            members: team.team_leaders.slice(1).map(member => ({
                id: member.id,
                name: member.full_name,
                email: member.email,
                phone: member.whatsapp_number,
                status: team.is_binusian ? 'BINUSIAN' : 'Non-BINUSIAN'
            }))
        }));
        
        participants = participantsData.map(p => ({
            id: p.id,
            name: p.full_name,
            teamName: p.teams.team_name,
            teamId: p.team_id,
            email: p.email,
            phone: p.whatsapp_number,
            lineId: p.line_id || '-',
            gitHub: p.github_id || '-',
            birth: `${p.birth_place}, ${new Date(p.birth_date).toLocaleDateString()}`,
            birthPlace: p.birth_place,
            birthDate: p.birth_date,
            registrationDate: p.created_at,
            status: p.teams.is_binusian ? 'BINUSIAN' : 'Non-BINUSIAN',
            roleInTeam: p.role.toUpperCase()
        }));
        
        if (statsResponse && statsResponse.ok) {
            const stats = await statsResponse.json();
            updateStatsFromAPI(stats);
        }
        
        return true;
    } catch (error) {
        console.error('Error fetching data:', error);
        if (error.message.includes('401') || error.message.includes('403')) {
            localStorage.removeItem('adminToken');
            window.location.href = 'login.html';
        }
        return false;
    }
}

function updateStatsFromAPI(stats) {
    document.getElementById('totalTeams').textContent = stats.total_teams || 0;
    document.getElementById('incompleteInfo').textContent = stats.incomplete_informations || 0;
    document.getElementById('totalParticipants').textContent = stats.total_participants || 0;
    
    if (stats.latest_registration) {
        const date = new Date(stats.latest_registration);
        const formattedDate = date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
        document.getElementById('latestRegistration').textContent = formattedDate;
    } else {
        document.getElementById('latestRegistration').textContent = '-';
    }
}

async function init() {
    adminToken = getAdminToken();
    if (!adminToken) return;
    
    const success = await fetchData();
    if (success) {
        initDashboard();
    } else {
        alert('Failed to load data from server');
        initDashboard();
    }
}

function initDashboard() {
    updateStats();
    setupSortButtons();
    renderTable();
    setupEventListeners();
}

function switchTab(tab) {
    currentTab = tab;
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(tab)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    if (currentTab === 'teams') {
        document.getElementById('bannerSection').style.display = 'block';
        document.getElementById('statsSection').style.display = 'grid';
        document.getElementById('searchInput').placeholder = 'Search by team name...';
        updateStats();
    } else {
        document.getElementById('bannerSection').style.display = 'none';
        document.getElementById('statsSection').style.display = 'none';
        document.getElementById('searchInput').placeholder = 'Search by participants name...';
    }
    
    setupSortButtons();
    renderTable();
}

function setupSortButtons() {
    const sortButtons = document.getElementById('sortButtons');
    if (currentTab === 'teams') {
        sortButtons.innerHTML = `
            <button class="sort-btn" onclick="toggleSort('name')">
                <span>Sort A-Z</span>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                    <path d="M16 14 H4 M16 14 L13.5 11.5 M16 14 L13.5 16.5" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 6 H16 M4 6 L6.5 3.5 M4 6 L6.5 8.5" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <button class="sort-btn" onclick="toggleSort('date')">
                <span>Date</span>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                    <path d="M16 14 H4 M16 14 L13.5 11.5 M16 14 L13.5 16.5" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 6 H16 M4 6 L6.5 3.5 M4 6 L6.5 8.5" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;
        const tableHead = document.getElementById('tableHead');
        tableHead.innerHTML = `
            <tr>
                <th style="width: 20%">Team Name</th>
                <th style="width: 20%">Leader</th>
                <th style="width: 25%">Email</th>
                <th style="width: 20%">Registration Date</th>
                <th style="width: 15%">Actions</th>
            </tr>
        `;
    } else {
        sortButtons.innerHTML = `
            <button class="sort-btn" onclick="toggleSort('name')">
                <span>Sort A-Z</span>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                    <path d="M16 14 H4 M16 14 L13.5 11.5 M16 14 L13.5 16.5" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 6 H16 M4 6 L6.5 3.5 M4 6 L6.5 8.5" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <button class="sort-btn" onclick="toggleSort('team')">
                <span>Team</span>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                    <path d="M16 14 H4 M16 14 L13.5 11.5 M16 14 L13.5 16.5" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 6 H16 M4 6 L6.5 3.5 M4 6 L6.5 8.5" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;
        const tableHead = document.getElementById('tableHead');
        tableHead.innerHTML = `
            <tr>
                <th style="width: 20%">Participants Name</th>
                <th style="width: 20%">Team</th>
                <th style="width: 25%">Email</th>
                <th style="width: 20%">Registration Date</th>
                <th style="width: 15%">Actions</th>
            </tr>
        `;
    }
}

function updateStats() {
    const totalTeams = teams.length;
    const incompleteInfo = teams.filter(t => t.hasIncompleteInfo).length;
    const totalParticipants = teams.reduce((sum, team) => sum + team.participants, 0);
    
    let latestDate = null;
    if (teams.length > 0) {
        latestDate = teams.reduce((latest, team) => {
            const teamDate = new Date(team.date);
            return teamDate > latest ? teamDate : latest;
        }, new Date(0));
    }
    
    const formattedDate = latestDate && latestDate.getTime() > 0 ? 
        latestDate.getDate() + ' ' + months[latestDate.getMonth()] + ' ' + latestDate.getFullYear() : 
        '-';
    
    document.getElementById('totalTeams').textContent = totalTeams;
    document.getElementById('incompleteInfo').textContent = incompleteInfo;
    document.getElementById('totalParticipants').textContent = totalParticipants;
    document.getElementById('latestRegistration').textContent = formattedDate;
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (currentTab === 'teams') {
        renderTeamsTable();
    } else {
        renderParticipantsTable();
    }
}

function renderTeamsTable() {
    const tbody = document.getElementById('tableBody');
    let sortedTeams = [...teams];
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        const searchTerm = searchInput.value.toLowerCase();
        sortedTeams = sortedTeams.filter(team => 
            team.name.toLowerCase().includes(searchTerm) ||
            team.leader.toLowerCase().includes(searchTerm) ||
            team.email.toLowerCase().includes(searchTerm)
        );
    }
    
    if (sortedTeams.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center; padding: 40px; color: #0F153D;">
                <div style="font-size: 14px; font-weight: 500;">
                    ${searchInput && searchInput.value ? 'No teams found matching your search' : 'No teams available'}
                </div>
            </td>
        `;
        tbody.appendChild(row);
        return;
    }
    
    if (sortStates.name !== 'none') {
        sortedTeams.sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return sortStates.name === 'asc' ? comparison : -comparison;
        });
    } else if (sortStates.date !== 'none') {
        sortedTeams.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const comparison = dateA - dateB;
            return sortStates.date === 'asc' ? comparison : -comparison;
        });
    }
    
    sortedTeams.forEach(team => {
        const row = document.createElement('tr');
        const date = new Date(team.date);
        const formattedDate = date.getFullYear() + '-' + 
                             String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                             String(date.getDate()).padStart(2, '0');
        
        row.innerHTML = `
            <td>${team.name}</td>
            <td>${team.leader}</td>
            <td>${team.email}</td>
            <td>${formattedDate}</td>
            <td>
                <div class="table-actions">
                    <button class="action-icon details" onclick="showTeamDetails(${team.id})" title="View Details">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M1 9C1 9 4 3 9 3C14 3 17 9 17 9C17 9 14 15 9 15C4 15 1 9 1 9Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 11.5C10.3807 11.5 11.5 10.3807 11.5 9C11.5 7.61929 10.3807 6.5 9 6.5C7.61929 6.5 6.5 7.61929 6.5 9C6.5 10.3807 7.61929 11.5 9 11.5Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="action-icon edit" onclick="showTeamEdit(${team.id})" title="Edit">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M10 1.5C10.1751 1.32491 10.383 1.186 10.6118 1.09124C10.8405 0.99649 11.0858 0.947754 11.3333 0.947754C11.5809 0.947754 11.8261 0.99649 12.0549 1.09124C12.2837 1.186 12.4916 1.32491 12.6667 1.5C12.8418 1.6751 12.9807 1.88302 13.0755 2.11178C13.1702 2.34054 13.219 2.58578 13.219 2.83334C13.219 3.0809 13.1702 3.32614 13.0755 3.5549C12.9807 3.78367 12.8418 3.99158 12.6667 4.16668L4 12.8333L0.5 14L1.66667 10.5L10 1.5Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="action-icon delete" onclick="showTeamDelete(${team.id})" title="Delete">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M2.25 4.5H3.375H15.75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderParticipantsTable() {
    const tbody = document.getElementById('tableBody');
    let sortedParticipants = [...participants];
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        const searchTerm = searchInput.value.toLowerCase();
        sortedParticipants = sortedParticipants.filter(participant => 
            participant.name.toLowerCase().includes(searchTerm) ||
            participant.teamName.toLowerCase().includes(searchTerm) ||
            participant.email.toLowerCase().includes(searchTerm)
        );
    }
    
    if (sortedParticipants.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center; padding: 40px; color: #0F153D;">
                <div style="font-size: 14px; font-weight: 500;">
                    ${searchInput && searchInput.value ? 'No participants found matching your search' : 'No participants available'}
                </div>
            </td>
        `;
        tbody.appendChild(row);
        return;
    }
    
    if (sortStates.name !== 'none') {
        sortedParticipants.sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return sortStates.name === 'asc' ? comparison : -comparison;
        });
    } else if (sortStates.team !== 'none') {
        sortedParticipants.sort((a, b) => {
            const comparison = a.teamName.localeCompare(b.teamName);
            return sortStates.team === 'asc' ? comparison : -comparison;
        });
    }
    
    sortedParticipants.forEach(participant => {
        const row = document.createElement('tr');
        const date = new Date(participant.registrationDate);
        const formattedDate = date.getFullYear() + '-' + 
                             String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                             String(date.getDate()).padStart(2, '0');
        
        row.innerHTML = `
            <td>${participant.name}</td>
            <td>${participant.teamName}</td>
            <td>${participant.email}</td>
            <td>${formattedDate}</td>
            <td>
                <div class="table-actions">
                    <button class="action-icon details" onclick="showParticipantDetails(${participant.id})" title="View Details">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M1 9C1 9 4 3 9 3C14 3 17 9 17 9C17 9 14 15 9 15C4 15 1 9 1 9Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 11.5C10.3807 11.5 11.5 10.3807 11.5 9C11.5 7.61929 10.3807 6.5 9 6.5C7.61929 6.5 6.5 7.61929 6.5 9C6.5 10.3807 7.61929 11.5 9 11.5Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="action-icon edit" onclick="showParticipantEdit(${participant.id})" title="Edit">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M10 1.5C10.1751 1.32491 10.383 1.186 10.6118 1.09124C10.8405 0.99649 11.0858 0.947754 11.3333 0.947754C11.5809 0.947754 11.8261 0.99649 12.0549 1.09124C12.2837 1.186 12.4916 1.32491 12.6667 1.5C12.8418 1.6751 12.9807 1.88302 13.0755 2.11178C13.1702 2.34054 13.219 2.58578 13.219 2.83334C13.219 3.0809 13.1702 3.32614 13.0755 3.5549C12.9807 3.78367 12.8418 3.99158 12.6667 4.16668L4 12.8333L0.5 14L1.66667 10.5L10 1.5Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="action-icon delete" onclick="showParticipantDelete(${participant.id})" title="Delete">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M2.25 4.5H3.375H15.75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function searchData() {
    renderTable();
}

function toggleSort(type) {
    const sortBtn = document.querySelectorAll('.sort-btn')[type === 'name' ? 0 : 1];
    const icon = sortBtn.querySelector('svg');
    
    if (currentTab === 'teams') {
        if (type === 'name') {
            sortStates.name = sortStates.name === 'asc' ? 'desc' : 'asc';
            sortStates.date = 'none';
            sortBtn.querySelector('span').textContent = sortStates.name === 'asc' ? 'Sort A-Z' : 'Sort Z-A';
        } else {
            sortStates.date = sortStates.date === 'asc' ? 'desc' : 'asc';
            sortStates.name = 'none';
        }
    } else {
        if (type === 'name') {
            sortStates.name = sortStates.name === 'asc' ? 'desc' : 'asc';
            sortStates.team = 'none';
            sortBtn.querySelector('span').textContent = sortStates.name === 'asc' ? 'Sort A-Z' : 'Sort Z-A';
        } else {
            sortStates.team = sortStates.team === 'asc' ? 'desc' : 'asc';
            sortStates.name = 'none';
        }
    }
    
    renderTable();
}

async function showTeamDetails(teamId) {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/admin/teams/${teamId}`);
        if (!response || !response.ok) throw new Error('Failed to fetch team details');
        
        const teamData = await response.json();
        selectedTeamId = teamId;
        
        document.getElementById('teamDetailName').textContent = teamData.team_name;
        const date = new Date(teamData.created_at);
        document.getElementById('teamRegDate').textContent = date.getFullYear() + '-' + 
                                                         String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                                                         String(date.getDate()).padStart(2, '0');
        document.getElementById('teamPassword').textContent = '••••••••';
        
        const leader = teamData.team_leaders.find(l => l.role === 'leader');
        if (leader) {
            document.getElementById('teamLeaderName').textContent = leader.full_name;
            document.getElementById('teamLeaderEmail').textContent = leader.email;
            document.getElementById('teamLeaderPhone').textContent = leader.whatsapp_number;
            document.getElementById('teamLeaderStatus').textContent = teamData.is_binusian ? 'BINUSIAN' : 'Non-BINUSIAN';
        }
        
        document.getElementById('teamCVName').textContent = teamData.team_name + "'s";
        document.getElementById('teamIDName').textContent = teamData.team_name + "'s";
        document.getElementById('teamIDType').textContent = teamData.is_binusian ? 'BINUSIAN Card' : 'Student ID';
        
        const membersContainer = document.getElementById('teamMembersContainer');
        membersContainer.innerHTML = '';
        
        const members = teamData.team_leaders.filter(m => m.role !== 'leader');
        members.forEach((member, index) => {
            const memberSection = document.createElement('div');
            memberSection.className = 'member-section';
            memberSection.innerHTML = `
                <h4>Member ${index + 1} Informations<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M7 4 L13 10 L7 16" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></h4>
                <div class="info-box">
                    <div class="info-row">
                        <span class="info-label">Name:</span>
                        <span class="info-value">${member.full_name}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${member.email}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Phone Number:</span>
                        <span class="info-value">${member.whatsapp_number}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Status:</span>
                        <span class="info-value">${teamData.is_binusian ? 'BINUSIAN' : 'Non-BINUSIAN'}</span>
                    </div>
                </div>
            `;
            membersContainer.appendChild(memberSection);
        });
        
        document.getElementById('teamDetailsPopup').style.display = 'flex';
    } catch (error) {
        console.error('Error showing team details:', error);
        alert('Failed to load team details');
    }
}

function showTeamDelete(teamId) {
    const team = teams.find(t => t.id === teamId);
    if (!team) {
        alert('Team not found');
        return;
    }
    
    selectedTeamId = teamId;
    document.querySelector('.deleteTeamName').textContent = team.name;
    document.getElementById('teamDeletePopup').style.display = 'flex';
}

async function showTeamEdit(teamId) {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/admin/teams/${teamId}`);
        if (!response || !response.ok) throw new Error('Failed to fetch team details');
        
        const teamData = await response.json();
        selectedTeamId = teamId;
        
        document.getElementById('editTeamName').value = teamData.team_name;
        
        const leader = teamData.team_leaders.find(l => l.role === 'leader');
        if (leader) {
            document.getElementById('editTeamLeader').value = leader.full_name;
            document.getElementById('editTeamEmail').value = leader.email;
            document.getElementById('editTeamPhone').value = leader.whatsapp_number;
        }
        
        document.getElementById('teamEditPopup').style.display = 'flex';
    } catch (error) {
        console.error('Error showing team edit:', error);
        alert('Failed to load team data');
    }
}

async function saveTeamEdit() {
    const teamName = document.getElementById('editTeamName').value.trim();
    const leaderName = document.getElementById('editTeamLeader').value.trim();
    const email = document.getElementById('editTeamEmail').value.trim();
    const phone = document.getElementById('editTeamPhone').value.trim();
    
    if (!teamName || !leaderName || !email || !phone) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        const teamResponse = await fetchWithAuth(`${API_URL}/api/admin/teams/${selectedTeamId}`, {
            method: 'PUT',
            body: JSON.stringify({
                team_name: teamName
            })
        });
        
        if (!teamResponse || !teamResponse.ok) {
            throw new Error('Failed to update team');
        }
        
        const teamDetailsResponse = await fetchWithAuth(`${API_URL}/api/admin/teams/${selectedTeamId}`);
        const teamData = await teamDetailsResponse.json();
        
        const leader = teamData.team_leaders.find(l => l.role === 'leader');
        if (leader) {
            const participantResponse = await fetchWithAuth(`${API_URL}/api/admin/participants/${leader.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    full_name: leaderName,
                    email: email,
                    whatsapp_number: phone
                })
            });
            
            if (!participantResponse || !participantResponse.ok) {
                throw new Error('Failed to update leader');
            }
        }
        
        await fetchData();
        renderTable();
        closeTeamPopup();
        
        alert('Team updated successfully!');
    } catch (error) {
        console.error('Error updating team:', error);
        alert('Failed to update team. Please try again.');
    }
}

function showTeamDelete(teamId) {
    const team = teams.find(t => t.id === teamId);
    if (!team) {
        alert('Team not found');
        return;
    }
    
    selectedTeamId = teamId;
    document.querySelector('.deleteTeamName').textContent = team.name;
    document.getElementById('teamDeletePopup').style.display = 'flex';
}

function closeTeamPopup() {
    document.getElementById('teamDetailsPopup').style.display = 'none';
    document.getElementById('teamEditPopup').style.display = 'none';
    document.getElementById('teamDeletePopup').style.display = 'none';
    selectedTeamId = null;
}

async function confirmTeamDelete() {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/admin/teams/${selectedTeamId}`, {
            method: 'DELETE'
        });
        
        if (!response || !response.ok) {
            throw new Error('Failed to delete team');
        }
        
        await fetchData();
        updateStats();
        renderTable();
        closeTeamPopup();
        
        alert('Team deleted successfully!');
    } catch (error) {
        console.error('Error deleting team:', error);
        alert('Failed to delete team. Please try again.');
    }
}

async function showParticipantDetails(participantId) {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/admin/participants/${participantId}`);
        if (!response || !response.ok) throw new Error('Failed to fetch participant details');
        
        const participantData = await response.json();
        selectedParticipantId = participantId;
        
        const teamInfoBox = document.getElementById('participantTeamInfoBox');
        const date = new Date(participantData.teams.created_at);
        const formattedDate = date.getFullYear() + '-' + 
                             String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                             String(date.getDate()).padStart(2, '0');
        
        teamInfoBox.innerHTML = `
            <div class="info-row">
                <span class="info-label">Team Name:</span>
                <span class="info-value">${participantData.teams.team_name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Registration Date:</span>
                <span class="info-value">${formattedDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Password:</span>
                <span class="info-value">••••••••</span>
            </div>
        `;
        
        const memberInfoBox = document.getElementById('participantInfoBox');
        memberInfoBox.innerHTML = `
            <div class="info-row">
                <span class="info-label">Status In Team:</span>
                <span class="info-value" style="font-weight: 600;">${participantData.role.toUpperCase()}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${participantData.full_name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${participantData.email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Phone Number:</span>
                <span class="info-value">${participantData.whatsapp_number}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Line ID:</span>
                <span class="info-value">${participantData.line_id || '-'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">GitHub:</span>
                <span class="info-value">${participantData.github_id || '-'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Birthplace/Date:</span>
                <span class="info-value">${participantData.birth_place}, ${new Date(participantData.birth_date).toLocaleDateString()}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">${participantData.teams.is_binusian ? 'BINUSIAN' : 'Non-BINUSIAN'}</span>
            </div>
        `;
        
        document.getElementById('participantCVName').textContent = participantData.full_name + "'s";
        document.getElementById('participantIDName').textContent = participantData.full_name + "'s";
        document.getElementById('participantIDType').textContent = participantData.teams.is_binusian ? 'BINUSIAN Card' : 'Student ID';
        
        document.getElementById('participantDetailsPopup').style.display = 'flex';
    } catch (error) {
        console.error('Error showing participant details:', error);
        alert('Failed to load participant details');
    }
}

function showParticipantDelete(participantId) {
    const participant = participants.find(p => p.id === participantId);
    if (!participant) {
        alert('Participant not found');
        return;
    }
    
    selectedParticipantId = participantId;
    document.querySelector('.deleteParticipantName').textContent = participant.name;
    document.getElementById('participantDeletePopup').style.display = 'flex';
}

async function showParticipantEdit(participantId) {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/admin/participants/${participantId}`);
        if (!response || !response.ok) throw new Error('Failed to fetch participant details');
        
        const participantData = await response.json();
        selectedParticipantId = participantId;
        
        document.getElementById('editParticipantTeam').value = participantData.teams.team_name;
        document.getElementById('editParticipantName').value = participantData.full_name;
        document.getElementById('editParticipantEmail').value = participantData.email;
        document.getElementById('editParticipantPhone').value = participantData.whatsapp_number;
        document.getElementById('editParticipantLineId').value = participantData.line_id || '';
        document.getElementById('editParticipantGitHub').value = participantData.github_id || '';
        document.getElementById('editParticipantBirth').value = `${participantData.birth_place}, ${new Date(participantData.birth_date).toLocaleDateString()}`;
        document.getElementById('editParticipantRole').value = participantData.role.toUpperCase();
        
        if (participantData.teams.is_binusian) {
            document.getElementById('editParticipantStatusBinusian').checked = true;
        } else {
            document.getElementById('editParticipantStatusNonBinusian').checked = true;
        }
        
        document.getElementById('participantEditPopup').style.display = 'flex';
    } catch (error) {
        console.error('Error showing participant edit:', error);
        alert('Failed to load participant data');
    }
}

async function saveParticipantEdit() {
    const name = document.getElementById('editParticipantName').value.trim();
    const email = document.getElementById('editParticipantEmail').value.trim();
    const phone = document.getElementById('editParticipantPhone').value.trim();
    const lineId = document.getElementById('editParticipantLineId').value.trim();
    const gitHub = document.getElementById('editParticipantGitHub').value.trim();
    const birth = document.getElementById('editParticipantBirth').value.trim();
    
    if (!name || !email || !phone) {
        alert('Please fill in required fields (name, email, phone)');
        return;
    }
    
    const birthParts = birth.split(',');
    const birthPlace = birthParts[0]?.trim() || '';
    const birthDateStr = birthParts[1]?.trim() || '';
    
    try {
        const response = await fetchWithAuth(`${API_URL}/api/admin/participants/${selectedParticipantId}`, {
            method: 'PUT',
            body: JSON.stringify({
                full_name: name,
                email: email,
                whatsapp_number: phone,
                line_id: lineId || null,
                github_id: gitHub || null,
                birth_place: birthPlace,
                birth_date: birthDateStr ? new Date(birthDateStr).toISOString().split('T')[0] : null
            })
        });
        
        if (!response || !response.ok) {
            throw new Error('Failed to update participant');
        }
        
        await fetchData();
        renderTable();
        closeParticipantPopup();
        
        alert('Participant updated successfully!');
    } catch (error) {
        console.error('Error updating participant:', error);
        alert('Failed to update participant. Please try again.');
    }
}

function showParticipantDelete(participantId) {
    const participant = participants.find(p => p.id === participantId);
    if (!participant) {
        alert('Participant not found');
        return;
    }
    
    selectedParticipantId = participantId;
    document.querySelector('.deleteParticipantName').textContent = participant.name;
    document.getElementById('participantDeletePopup').style.display = 'flex';
}

function closeParticipantPopup() {
    document.getElementById('participantDetailsPopup').style.display = 'none';
    document.getElementById('participantEditPopup').style.display = 'none';
    document.getElementById('participantDeletePopup').style.display = 'none';
    selectedParticipantId = null;
}

async function confirmParticipantDelete() {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/admin/participants/${selectedParticipantId}`, {
            method: 'DELETE'
        });
        
        if (!response || !response.ok) {
            throw new Error('Failed to delete participant');
        }
        
        await fetchData();
        renderTable();
        closeParticipantPopup();
        
        alert('Participant deleted successfully!');
    } catch (error) {
        console.error('Error deleting participant:', error);
        alert('Failed to delete participant. Please try again.');
    }
}

function downloadTeamCV() {
    alert('CV download feature will be implemented');
}

function downloadTeamID() {
    alert('ID download feature will be implemented');
}

function downloadParticipantCV() {
    alert('CV download feature will be implemented');
}

function downloadParticipantID() {
    alert('ID download feature will be implemented');
}

function setupEventListeners() {
    document.querySelectorAll('.popup-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                if (currentTab === 'teams') {
                    closeTeamPopup();
                } else {
                    closeParticipantPopup();
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', init);