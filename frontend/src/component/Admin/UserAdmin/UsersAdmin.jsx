import React, { useEffect, useState } from "react";
import { useAuth } from "../../../lib/clerk-shim";
import { getAllProfiles } from "../../../services/userService";
import UserTable from "../UserAdmin/UserTable";
import UserDetailsModal from "../UserAdmin/UserDetailsModal";

export default function UsersAdmin() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

  useEffect(() => {
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