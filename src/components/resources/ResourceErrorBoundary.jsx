import { Component } from 'react';

export class ResourceErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-lg mx-auto py-16 px-4 text-center text-sm text-[#2A2F7F]">
          <p>Something went wrong loading the shop.</p>
          <button
            type="button"
            className="resources-link mt-4 josefin uppercase tracking-widest text-xs"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
