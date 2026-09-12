package com.fittrack.backend.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.fittrack.backend.dto.HierarchyAuditDTO;
import com.fittrack.backend.entity.Branch;
import com.fittrack.backend.entity.Organization;
import com.fittrack.backend.entity.Role;
import com.fittrack.backend.entity.User;
import com.fittrack.backend.entity.enums.RoleName;
import com.fittrack.backend.repository.AuditLogRepository;
import com.fittrack.backend.repository.MemberRepository;
import com.fittrack.backend.repository.OrganizationRepository;
import com.fittrack.backend.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock
    private MemberRepository memberRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OrganizationRepository organizationRepository;

    private AdminServiceImpl adminService;

    @BeforeEach
    void setUp() {
        adminService = new AdminServiceImpl(memberRepository, auditLogRepository, userRepository, organizationRepository);
    }

    @Test
    void getHierarchyAudit_limitsAdminsToTheirOrganization() {
        Organization orgOne = organization(1L, "Org One");
        Organization orgTwo = organization(2L, "Org Two");
        Branch branchOne = branch(10L, "Main", orgOne);
        Branch branchTwo = branch(20L, "Second", orgTwo);

        User orgOneTrainer = user(100L, "Trainer One", RoleName.TRAINER, orgOne, branchOne, null, true);
        User orgTwoTrainer = user(200L, "Trainer Two", RoleName.TRAINER, orgTwo, branchTwo, null, false);

        when(userRepository.findAll()).thenReturn(List.of(orgOneTrainer, orgTwoTrainer));
        when(organizationRepository.findById(1L)).thenReturn(Optional.of(orgOne));

        HierarchyAuditDTO.SnapshotDTO snapshot = adminService.getHierarchyAudit("ADMIN", 1L);

        assertEquals("ORGANIZATION", snapshot.getSummary().getScope());
        assertEquals(1L, snapshot.getSummary().getOrganizationId());
        assertEquals(1, snapshot.getSummary().getTotalUsers());
        assertTrue(snapshot.getIssues().stream().allMatch(issue -> Long.valueOf(1L).equals(issue.getOrganizationId())));
    }

    @Test
    void getHierarchyAudit_flagsMissingOrganizationAndInvalidSupervisor() {
        Organization org = organization(1L, "Org One");
        Branch branch = branch(10L, "Main", org);
        User trainerSupervisor = user(20L, "Trainer Sup", RoleName.TRAINER, org, branch, null, true);
        User adminTarget = user(30L, "Admin Target", RoleName.ADMIN, org, branch, trainerSupervisor, true);
        User memberNoOrg = user(40L, "Member No Org", RoleName.USER, null, null, null, true);

        when(userRepository.findAll()).thenReturn(List.of(trainerSupervisor, adminTarget, memberNoOrg));
        when(organizationRepository.count()).thenReturn(1L);

        HierarchyAuditDTO.SnapshotDTO snapshot = adminService.getHierarchyAudit("SUPER_ADMIN", null);

        assertEquals("GLOBAL", snapshot.getSummary().getScope());
        assertEquals(1, snapshot.getSummary().getUsersWithoutOrganization());
        assertEquals(1, snapshot.getSummary().getUsersWithInvalidSupervisor());
        assertTrue(snapshot.getIssues().stream().anyMatch(issue -> "MISSING_ORGANIZATION".equals(issue.getIssueCode())));
        assertTrue(snapshot.getIssues().stream().anyMatch(issue -> "INVALID_SUPERVISOR_ROLE".equals(issue.getIssueCode())));
    }

    private Organization organization(Long id, String name) {
        Organization organization = new Organization();
        organization.setId(id);
        organization.setName(name);
        return organization;
    }

    private Branch branch(Long id, String name, Organization organization) {
        Branch branch = new Branch();
        branch.setId(id);
        branch.setName(name);
        branch.setOrganization(organization);
        return branch;
    }

    private User user(Long id, String name, RoleName roleName, Organization organization, Branch branch, User supervisor, boolean active) {
        Role role = new Role();
        role.setName(roleName);

        User user = new User();
        user.setId(id);
        user.setFullName(name);
        user.setEmail(name.toLowerCase().replace(' ', '.') + "@fittrack.app");
        user.setRole(role);
        user.setOrganization(organization);
        user.setBranch(branch);
        user.setSupervisor(supervisor);
        user.setActive(active);
        return user;
    }
}


