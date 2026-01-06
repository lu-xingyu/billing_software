package in.xing.billingsoftware.service;

import in.xing.billingsoftware.io.UserRequest;
import in.xing.billingsoftware.io.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserRequest request);

    String getUserRole(String email);

    List<UserResponse> readUsers();

    void deleteUser(String id);

}
