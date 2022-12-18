export enum ROLES {
  Admin = 'Admin',
  Manager = "Manager",
  User = "User"
};

export const verifyRoles = (allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req?.auth.role) return res.status(401).send({message: 'Unauthorized'});
    const result = allowedRoles.includes(req.auth.role);
    if (!result) return res.status(401).send({message: 'Unauthorized'});
    next();
  }
}
