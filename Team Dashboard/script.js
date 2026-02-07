let teamMembers = { member1: null, member2: null, member3: null };

function openLogoutModal() {
  document.getElementById("logoutModal").style.display = "flex";
}
function closeLogoutModal() {
  document.getElementById("logoutModal").style.display = "none";
}
function confirmLogout() {
  alert("Berhasil Logout!");
  window.location.href = "index.html";
}

function openAddMemberModal() {
  let slotToFill = "";
  if (!teamMembers.member1) slotToFill = "Member 1";
  else if (!teamMembers.member2) slotToFill = "Member 2";
  else if (!teamMembers.member3) slotToFill = "Member 3";
  else {
    alert("Team Full!");
    return;
  }
  document.getElementById("modalMemberTitle").innerText = slotToFill;
  document.getElementById("addMemberModal").style.display = "block";
  document
    .querySelectorAll(".error-text")
    .forEach((el) => (el.style.display = "none"));
}
function closeAddMemberModal() {
  document.getElementById("addMemberModal").style.display = "none";
  document.getElementById("addMemberForm").reset();
}

function handleFormSubmit(event) {
  event.preventDefault();
  let isValid = true;
  document
    .querySelectorAll(".error-text")
    .forEach((el) => (el.style.display = "none"));
  const name = document.getElementById("inputName").value;
  if (!name) {
    document.getElementById("errName").style.display = "block";
    isValid = false;
  }
  const email = document.getElementById("inputEmail").value;
  if (!email || !email.includes("@")) {
    document.getElementById("errEmail").style.display = "block";
    isValid = false;
  }
  const wa = document.getElementById("inputWA").value;
  if (!wa || wa.length < 9) {
    document.getElementById("errWA").style.display = "block";
    isValid = false;
  }
  if (!document.getElementById("inputLine").value) {
    document.getElementById("errLine").style.display = "block";
    isValid = false;
  }
  if (!document.getElementById("inputGithub").value) {
    document.getElementById("errGithub").style.display = "block";
    isValid = false;
  }
  if (!document.getElementById("inputBirthPlace").value) {
    document.getElementById("errBirthPlace").style.display = "block";
    isValid = false;
  }
  if (!document.getElementById("inputBirthDate").value) {
    document.getElementById("errBirthDate").style.display = "block";
    isValid = false;
  }
  if (!document.getElementById("inputCV").value) {
    document.getElementById("errCV").style.display = "block";
    isValid = false;
  }
  if (!document.getElementById("inputIDCard").value) {
    document.getElementById("errIDCard").style.display = "block";
    isValid = false;
  }

  if (isValid) {
    if (!teamMembers.member1) {
      teamMembers.member1 = name;
      updateMemberUI("member1", name);
    } else if (!teamMembers.member2) {
      teamMembers.member2 = name;
      updateMemberUI("member2", name);
    } else if (!teamMembers.member3) {
      teamMembers.member3 = name;
      updateMemberUI("member3", name);
    }
    closeAddMemberModal();
    if (teamMembers.member1 && teamMembers.member2 && teamMembers.member3) {
      const btn = document.getElementById("btnAddMember");
      btn.innerText = "Team Full";
      btn.style.opacity = "0.5";
      btn.disabled = true;
    }
  }
}

function simulateUpload(inputId) {
  document.getElementById(inputId).value = "file_uploaded.pdf";
}
function updateMemberUI(elementId, name) {
  const span = document.querySelector(`#${elementId} .username-text`);
  if (span) {
    span.innerText = name;
    span.style.color = "#fff";
    span.style.fontWeight = "bold";
  }
}

window.onclick = function (event) {
  if (event.target == document.getElementById("logoutModal"))
    closeLogoutModal();
  if (event.target == document.getElementById("addMemberModal"))
    closeAddMemberModal();
};
