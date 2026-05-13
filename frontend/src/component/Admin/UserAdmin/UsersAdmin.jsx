import React, { useEffect, useState } from "react";
import { useAuth } from "../../../lib/AuthHooks";
import { getAllProfiles } from "../../../services/userService";
import UserTable from "../UserAdmin/UserTable";
import UserDetailsModal from "../UserAdmin/UserDetailsModal";

export default function UsersAdmin({ globalSearchQuery = "" }) {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); const [searchTerm, setSearchTerm] = useState("");

  async function fetchUsers() {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getAllProfiles(token);
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(u => { const query = (searchTerm || globalSearchQuery).toLowerCase(); return u.email?.toLowerCase().includes(query) || u.first_name?.toLowerCase().includes(query) || u.last_name?.toLowerCase().includes(query) || u.phone?.includes(query); }); useEffect(() => {
    fetchUsers();
  }, [getToken]);


  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Utilisateurs</h1>
      <UserTable users={users} loading={loading} onView={(u) => setSelectedUser(u)} />
      <UserDetailsModal user={selectedUser} isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} onUpdated={fetchUsers} />
    </div>
  );
}
