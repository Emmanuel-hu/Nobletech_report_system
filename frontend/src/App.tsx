import AppRoutes from './routes/AppRoutes';

const App = (): JSX.Element => {
  return (
    <div className="app-shell">
      <AppRoutes />
    </div>
  );
};

export default App;
