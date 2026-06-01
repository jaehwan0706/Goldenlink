import React from "react";

export default function MegaMenu({
  menuItems,
  activeMenu,
  setActiveMenu,
  showMega,
  setShowMega,
  onMenuClick, // ✅ 추가
}) {
  
  const handleClick = (e, label) => {
    e.preventDefault();
    if (onMenuClick) {
      onMenuClick(label);
    }
  };

  return (
    <nav
      className="gl-nav"
      onMouseEnter={() => {
        setShowMega(true);
        if (activeMenu === null) setActiveMenu(0);
      }}
      onMouseLeave={() => {
        setShowMega(false);
        setActiveMenu(null);
      }}
    >
      <div className="gl-navRow">
        {menuItems.map((m, idx) => (
          <a
            key={m.label}
            className={`gl-navItem ${activeMenu === idx ? "is-active" : ""}`}
            href={m.href}
            onMouseEnter={() => setActiveMenu(idx)}
            onClick={(e) => handleClick(e, m.label)}
          >
            {m.label}
          </a>
        ))}
      </div>

      {showMega && menuItems.some(m => m.subItems && m.subItems.length > 0) && (
        <div className="gl-mega">
          <div className="gl-megaInner">
            {menuItems.map((m, idx) => (
              <div
                key={m.label}
                className={`gl-megaCol ${activeMenu === idx ? "is-active" : ""}`}
                onMouseEnter={() => setActiveMenu(idx)}
              >
                <div className="gl-megaTitle">{m.label}</div>
                <div className="gl-megaList">
                  {m.subItems && m.subItems.map((s) => (
                    <a 
                      key={s.label} 
                      className="gl-megaLink" 
                      href={s.href}
                      onClick={(e) => handleClick(e, s.label)}
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}